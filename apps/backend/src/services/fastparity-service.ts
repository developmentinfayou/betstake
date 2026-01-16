import { FastParitySession, IFastParitySession } from '@casino/database';
import { v4 as uuidv4 } from 'uuid';

export interface SessionAnalytics {
  totalSessions: number;
  averageSessionDuration: number;
  totalProfit: number;
  winRate: number;
  favoriteMode: string;
  hotNumbers: Array<{ number: number; frequency: number; percentage: number }>;
  colorDistribution: { green: number; red: number; violet: number };
  riskProfile: {
    level: string;
    averageBet: number;
    maxBet: number;
    volatility: number;
  };
  specialEventStats: {
    totalEvents: number;
    jackpots: number;
    lightningStrikes: number;
    megaWins: number;
    totalEventProfit: number;
  };
}

export interface PatternAnalysis {
  streakPatterns: {
    longestWinStreak: number;
    longestLossStreak: number;
    averageWinStreak: number;
    averageLossStreak: number;
  };
  numberPatterns: {
    hotNumbers: number[];
    coldNumbers: number[];
    evenOddRatio: number;
    colorBalance: { green: number; red: number; violet: number };
  };
  timePatterns: {
    peakHours: number[];
    bestPerformingHour: number;
    worstPerformingHour: number;
  };
  betPatterns: {
    preferredBetTypes: string[];
    multiBetUsage: number;
    riskTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

export class FastParityService {
  static async getOrCreateSession(
    userId: string, 
    mode: 'classic' | 'lightning' | 'mega' | 'turbo' = 'classic'
  ): Promise<IFastParitySession> {
    let session = await FastParitySession.findOne({ 
      userId, 
      isActive: true,
      mode 
    });

    if (!session) {
      session = new FastParitySession({
        userId,
        sessionId: uuidv4(),
        mode,
        startedAt: new Date()
      });
      await session.save();
    }

    return session;
  }

  static async updateSession(
    sessionId: string,
    betResult: any,
    betAmount: number,
    betType: string
  ): Promise<void> {
    const session = await FastParitySession.findOne({ sessionId });
    if (!session) return;

    session.updateStats(betResult, betAmount);

    if (session.betTypes[betType as keyof typeof session.betTypes] !== undefined) {
      session.betTypes[betType as keyof typeof session.betTypes] += 1;
    }

    if (betResult.result.multiBetResults && betResult.result.multiBetResults.length > 0) {
      session.multiBetSessions += 1;
      session.multiBetProfit += betResult.profit;
    }

    if (betResult.won && betResult.profit > 0) {
      if (!session.peakWinTime || betResult.profit > session.totalProfit) {
        session.peakWinTime = new Date();
      }
    } else if (!betResult.won) {
      if (!session.peakLossTime || Math.abs(betResult.profit) > Math.abs(session.totalProfit)) {
        session.peakLossTime = new Date();
      }
    }

    await session.save();
  }

  static async endSession(userId: string, mode?: string): Promise<void> {
    const query: any = { userId, isActive: true };
    if (mode) query.mode = mode;

    const session = await FastParitySession.findOne(query);
    if (session) {
      session.endSession();
      await session.save();
    }
  }

  static async getUserAnalytics(userId: string): Promise<SessionAnalytics> {
    const sessions = await FastParitySession.find({ userId });
    
    if (sessions.length === 0) {
      return this.getEmptyAnalytics();
    }

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0);
    const totalProfit = sessions.reduce((sum, s) => sum + s.totalProfit, 0);
    const totalBets = sessions.reduce((sum, s) => sum + s.totalBets, 0);
    const totalWins = sessions.reduce((sum, s) => sum + s.winStreak, 0);
    const totalWagered = sessions.reduce((sum, s) => sum + s.totalWagered, 0);

    const modeCount = sessions.reduce((acc, s) => {
      acc[s.mode] = (acc[s.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favoriteMode = Object.entries(modeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'classic';

    const numberFreq = new Map<number, number>();
    sessions.forEach(session => {
      for (let i = 0; i <= 9; i++) {
        const freq = session.numberFrequency.get(i) || 0;
        numberFreq.set(i, (numberFreq.get(i) || 0) + freq);
      }
    });

    const hotNumbers = Array.from(numberFreq.entries())
      .map(([number, frequency]) => ({
        number,
        frequency,
        percentage: totalBets > 0 ? (frequency / totalBets) * 100 : 0
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    const colorDistribution = sessions.reduce(
      (acc, s) => ({
        green: acc.green + s.colorFrequency.green,
        red: acc.red + s.colorFrequency.red,
        violet: acc.violet + s.colorFrequency.violet
      }),
      { green: 0, red: 0, violet: 0 }
    );

    const maxBet = Math.max(...sessions.map(s => s.maxBetAmount));
    const avgBet = totalWagered / totalBets || 0;
    const betVariance = sessions.reduce((sum, s) => {
      const sessionAvg = s.totalWagered / s.totalBets || 0;
      return sum + Math.pow(sessionAvg - avgBet, 2);
    }, 0) / totalSessions;
    const volatility = Math.sqrt(betVariance);

    let riskLevel = 'low';
    if (avgBet > 1000) riskLevel = 'extreme';
    else if (avgBet > 500) riskLevel = 'high';
    else if (avgBet > 100) riskLevel = 'medium';

    const allSpecialEvents = sessions.flatMap(s => s.specialEvents);
    const specialEventStats = {
      totalEvents: allSpecialEvents.length,
      jackpots: allSpecialEvents.filter(e => e.type === 'jackpot').length,
      lightningStrikes: allSpecialEvents.filter(e => e.type === 'lightning_strike').length,
      megaWins: allSpecialEvents.filter(e => e.type === 'mega_win').length,
      totalEventProfit: allSpecialEvents.reduce((sum, e) => sum + e.payout, 0)
    };

    return {
      totalSessions,
      averageSessionDuration: totalDuration / totalSessions || 0,
      totalProfit,
      winRate: totalBets > 0 ? (totalWins / totalBets) * 100 : 0,
      favoriteMode,
      hotNumbers,
      colorDistribution,
      riskProfile: {
        level: riskLevel,
        averageBet: avgBet,
        maxBet,
        volatility
      },
      specialEventStats
    };
  }

  private static getEmptyAnalytics(): SessionAnalytics {
    return {
      totalSessions: 0,
      averageSessionDuration: 0,
      totalProfit: 0,
      winRate: 0,
      favoriteMode: 'classic',
      hotNumbers: [],
      colorDistribution: { green: 0, red: 0, violet: 0 },
      riskProfile: {
        level: 'low',
        averageBet: 0,
        maxBet: 0,
        volatility: 0
      },
      specialEventStats: {
        totalEvents: 0,
        jackpots: 0,
        lightningStrikes: 0,
        megaWins: 0,
        totalEventProfit: 0
      }
    };
  }
}