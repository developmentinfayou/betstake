'use client';

interface JackpotTrackerProps {
  condition?: {
    type: 'streak' | 'next_bets' | 'percentage';
    value: number;
    streakType?: 'win' | 'lose';
  };
  currentStreak?: number;
  remainingBets?: number;
  jackpotPool?: number;
}

export default function JackpotTracker({ 
  condition, 
  currentStreak = 0, 
  remainingBets = 0,
  jackpotPool = 1250.50 
}: JackpotTrackerProps) {
  if (!condition) return null;

  const getProgress = () => {
    if (condition.type === 'streak') {
      return Math.min((currentStreak / condition.value) * 100, 100);
    }
    if (condition.type === 'next_bets') {
      const completed = condition.value - remainingBets;
      return Math.min((completed / condition.value) * 100, 100);
    }
    return condition.value; // percentage type
  };

  const getProgressText = () => {
    if (condition.type === 'streak') {
      return `${currentStreak}/${condition.value} ${condition.streakType}s`;
    }
    if (condition.type === 'next_bets') {
      return `${remainingBets} bets remaining`;
    }
    return `${condition.value}% chance each bet`;
  };

  return (
    <div className="card bg-special/10 border border-special/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-special">🎰 Jackpot Tracker</h3>
        <div className="text-xl font-bold text-secondary">${jackpotPool.toFixed(2)}</div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-special">{getProgressText()}</span>
        </div>
        
        {condition.type !== 'percentage' && (
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-special to-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        )}
        
        <div className="text-xs text-gray-400 text-center">
          {condition.type === 'streak' && `Get ${condition.value} ${condition.streakType}s in a row`}
          {condition.type === 'next_bets' && `Win next ${condition.value} bets in a row`}
          {condition.type === 'percentage' && `${condition.value}% chance every bet`}
        </div>
      </div>
    </div>
  );
}