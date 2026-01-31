'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminPanel() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Dashboard Stats
  const [stats, setStats] = useState<any>(null);
  const [gameStats, setGameStats] = useState<any[]>([]);

  // Enhanced Analytics (Phase 1)
  const [realtimeStats, setRealtimeStats] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('7d');

  // Games Management
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  // Jackpots Management
  const [jackpots, setJackpots] = useState<any[]>([]);
  const [selectedJackpot, setSelectedJackpot] = useState<any>(null);

  // Users Management
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);

  // Enhanced User Management (Phase 2)
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [balanceAdjust, setBalanceAdjust] = useState({ currency: 'USD', amount: 0, reason: '' });
  const [banReason, setBanReason] = useState('');

  // Contests Management
  const [contests, setContests] = useState<any[]>([]);
  const [newContest, setNewContest] = useState<any>(null);

  // Challenge Management (New System)
  const [challenges, setChallenges] = useState<any[]>([]);
  const [challengeStats, setChallengeStats] = useState<any>(null);
  const [showChallengeWizard, setShowChallengeWizard] = useState(false);
  const [newChallenge, setNewChallenge] = useState<{
    title: string;
    description: string;
    games: string[];
    minBetAmount: number;
    currency: string;
    conditions: any[];
    prize: { type: string; amount: number; currency: string };
    winners: { type: string; count: number; duration?: number };
    startTime: string;
    endTime: string;
  }>({
    title: '',
    description: '',
    games: [],
    minBetAmount: 1,
    currency: 'USD',
    conditions: [{ type: 'WIN_X_IN_ROW', count: 3 }],
    prize: { type: 'FIXED', amount: 100, currency: 'USD' },
    winners: { type: 'FIRST_X', count: 1 },
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });

  // Activity Logs (Audit Trail)
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [logStats, setLogStats] = useState<any>(null);

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      router.push('/');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadGames(),
        loadJackpots(),
        loadUsers(),
        loadContests(),
        loadChallenges(),
        loadActivityLogs()
      ]);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [statsRes, gameStatsRes, realtimeRes, trendsRes, revenueRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/admin/stats/games`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/admin/stats/realtime`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/admin/stats/trends`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/admin/stats/revenue?period=7d`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(await statsRes.json());
      setGameStats(await gameStatsRes.json());
      if (realtimeRes.ok) setRealtimeStats(await realtimeRes.json());
      if (trendsRes.ok) setTrends(await trendsRes.json());
      if (revenueRes.ok) setRevenueData(await revenueRes.json());
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadGames = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/games`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGames(await res.json());
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  const loadJackpots = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/jackpots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJackpots(await res.json());
    } catch (error) {
      console.error('Failed to load jackpots:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users?page=${userPage}&search=${userSearch}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  // Enhanced User Management Functions (Phase 2)
  const loadUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const details = await res.json();
        setUserDetails(details);
        setSelectedUser(details.user);
      } else {
        toast.error('Failed to load user details');
      }
    } catch (error) {
      console.error('Failed to load user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const adjustBalance = async () => {
    if (!selectedUser || !balanceAdjust.reason || balanceAdjust.reason.length < 5) {
      toast.error('Reason is required (min 5 characters)');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${selectedUser._id}/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(balanceAdjust)
      });
      if (res.ok) {
        toast.success(`Balance adjusted: ${balanceAdjust.amount >= 0 ? '+' : ''}$${balanceAdjust.amount}`);
        setShowBalanceModal(false);
        setBalanceAdjust({ currency: 'USD', amount: 0, reason: '' });
        loadUserDetails(selectedUser._id);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to adjust balance');
      }
    } catch (error) {
      toast.error('Failed to adjust balance');
    }
  };

  const banUser = async () => {
    if (!selectedUser || !banReason || banReason.length < 5) {
      toast.error('Reason is required (min 5 characters)');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${selectedUser._id}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ banned: !selectedUser.isBanned, reason: banReason })
      });
      if (res.ok) {
        toast.success(selectedUser.isBanned ? 'User unbanned' : 'User banned');
        setShowBanModal(false);
        setBanReason('');
        loadUserDetails(selectedUser._id);
        loadUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update ban status');
      }
    } catch (error) {
      toast.error('Failed to update ban status');
    }
  };

  const loadContests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/contests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContests(await res.json());
    } catch (error) {
      console.error('Failed to load contests:', error);
    }
  };

  const loadChallenges = async () => {
    try {
      const [challengesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/challenges`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/admin/challenges/stats/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const challengesData = await challengesRes.json();
      setChallenges(challengesData.challenges || []);
      setChallengeStats(await statsRes.json());
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/logs?limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/admin/logs/stats?days=7`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const logsData = await logsRes.json();
      setActivityLogs(logsData.logs || []);
      setLogStats(await statsRes.json());
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    }
  };

  const createChallenge = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newChallenge)
      });

      if (res.ok) {
        toast.success('Challenge created successfully');
        setShowChallengeWizard(false);
        setNewChallenge({
          title: '',
          description: '',
          games: [],
          minBetAmount: 1,
          currency: 'USD',
          conditions: [{ type: 'WIN_X_IN_ROW', count: 3 }],
          prize: { type: 'FIXED', amount: 100, currency: 'USD' },
          winners: { type: 'FIRST_X', count: 1 },
          startTime: new Date().toISOString().slice(0, 16),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
        });
        loadChallenges();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create challenge');
      }
    } catch (error) {
      toast.error('Failed to create challenge');
    }
  };

  const activateChallenge = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/challenges/${id}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success('Challenge activated');
        loadChallenges();
      }
    } catch (error) {
      toast.error('Failed to activate challenge');
    }
  };

  const cancelChallenge = async (id: string, reason: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/challenges/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        toast.success('Challenge cancelled');
        loadChallenges();
      }
    } catch (error) {
      toast.error('Failed to cancel challenge');
    }
  };

  const deleteChallenge = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/challenges/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success('Challenge deleted');
        loadChallenges();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete challenge');
      }
    } catch (error) {
      toast.error('Failed to delete challenge');
    }
  };
  const updateGame = async (gameType: string, updates: any) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/games/${gameType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        toast.success('Game updated successfully');
        loadGames();
      }
    } catch (error) {
      toast.error('Failed to update game');
    }
  };

  const updateJackpot = async (id: string, updates: any) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/jackpots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        toast.success('Jackpot updated successfully');
        loadJackpots();
      }
    } catch (error) {
      toast.error('Failed to update jackpot');
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });

      if (res.ok) {
        toast.success('User role updated');
        loadUsers();
      }
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const createContest = async (contestData: any) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/contests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(contestData)
      });

      if (res.ok) {
        toast.success('Contest created successfully');
        loadContests();
        setNewContest(null);
      }
    } catch (error) {
      toast.error('Failed to create contest');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl gradient-text">Loading Admin Panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      {/* test to push in rahul branch  */}
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold gradient-text">
              CasinoBit Admin
            </Link>
            <span className="text-sm text-gray-400">Welcome, {user?.username}</span>
          </div>
          <Link href="/" className="btn-secondary">
            Back to Site
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="card sticky top-4">
              <h3 className="text-xl font-bold mb-4 gradient-text">Admin Menu</h3>
              <nav className="space-y-2">
                {[
                  { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
                  { id: 'games', label: '🎮 Games Config', icon: '🎮' },
                  { id: 'jackpots', label: '🎰 Jackpots', icon: '🎰' },
                  { id: 'users', label: '👥 Users', icon: '👥' },
                  { id: 'challenges', label: '🏆 Challenges', icon: '🏆' },
                  { id: 'contests', label: '🎯 Contests', icon: '🎯' },
                  { id: 'logs', label: '📋 Activity Logs', icon: '📋' },
                  { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary to-secondary text-black font-bold'
                      : 'hover:bg-gray-800 text-gray-300'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {/* Dashboard Tab - Enhanced Analytics */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold gradient-text">Platform Analytics</h2>
                  <div className="flex items-center gap-2">
                    {(['24h', '7d', '30d'] as const).map(period => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedPeriod === period
                          ? 'bg-primary text-black'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time Stats Row */}
                {realtimeStats && (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="card bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-800/50">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-green-400">🟢 Online Now</div>
                        <div className="text-xs text-gray-500">Live</div>
                      </div>
                      <div className="text-3xl font-bold text-green-400">{realtimeStats.onlineUsers}</div>
                      <div className="text-xs text-gray-400">{realtimeStats.activeUsers} active (1h)</div>
                    </div>
                    <div className="card bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-800/50">
                      <div className="text-sm text-blue-400">⚡ Recent Bets</div>
                      <div className="text-3xl font-bold text-blue-400">{realtimeStats.recentBets}</div>
                      <div className="text-xs text-gray-400">Last 5 minutes</div>
                    </div>
                    <div className="card bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border border-yellow-800/50">
                      <div className="text-sm text-yellow-400">💰 Live Volume</div>
                      <div className="text-3xl font-bold text-yellow-400">${(realtimeStats.liveVolume || 0).toFixed(0)}</div>
                      <div className="text-xs text-gray-400">Last hour</div>
                    </div>
                    <div className="card bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-800/50">
                      <div className="text-sm text-purple-400">🎰 Jackpot Pool</div>
                      <div className="text-3xl font-bold text-purple-400">${(realtimeStats.jackpotPool || 0).toFixed(0)}</div>
                      <div className="text-xs text-gray-400">Total across games</div>
                    </div>
                  </div>
                )}

                {/* Trend Stats with ↑↓ Indicators */}
                {trends && trends[selectedPeriod] && (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Bets ({selectedPeriod})</span>
                        <span className={`text-sm font-bold ${trends[selectedPeriod].betsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trends[selectedPeriod].betsChange >= 0 ? '↑' : '↓'} {Math.abs(trends[selectedPeriod].betsChange)}%
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-primary">{trends[selectedPeriod].bets.toLocaleString()}</div>
                    </div>
                    <div className="card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Volume ({selectedPeriod})</span>
                        <span className={`text-sm font-bold ${trends[selectedPeriod].volumeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trends[selectedPeriod].volumeChange >= 0 ? '↑' : '↓'} {Math.abs(trends[selectedPeriod].volumeChange)}%
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-secondary">${trends[selectedPeriod].volume.toFixed(0)}</div>
                    </div>
                    <div className="card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Profit ({selectedPeriod})</span>
                        <span className={`text-sm font-bold ${trends[selectedPeriod].profitChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trends[selectedPeriod].profitChange >= 0 ? '↑' : '↓'} {Math.abs(trends[selectedPeriod].profitChange)}%
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-special">${trends[selectedPeriod].profit.toFixed(0)}</div>
                    </div>
                    <div className="card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">New Users ({selectedPeriod})</span>
                        <span className={`text-sm font-bold ${trends[selectedPeriod].newUsersChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trends[selectedPeriod].newUsersChange >= 0 ? '↑' : '↓'} {Math.abs(trends[selectedPeriod].newUsersChange)}%
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-alt">{trends[selectedPeriod].newUsers}</div>
                    </div>
                  </div>
                )}

                {/* Revenue by Game */}
                {revenueData && revenueData.byGame && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="card">
                      <h3 className="text-xl font-bold mb-4">📊 Revenue by Game</h3>
                      <div className="space-y-3">
                        {revenueData.byGame.slice(0, 6).map((game: any) => (
                          <div key={game._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold">{game._id}</span>
                              <span className="text-xs text-gray-500">{game.bets} bets</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-secondary"
                                  style={{ width: `${Math.min(100, (game.volume / (revenueData.totals?.volume || 1)) * 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-green-400">${game.profit?.toFixed(0) || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="text-xl font-bold mb-4">💵 Revenue Summary</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Volume</span>
                          <span className="text-2xl font-bold">${revenueData.totals?.volume?.toFixed(0) || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Payout</span>
                          <span className="text-2xl font-bold text-red-400">-${revenueData.totals?.payout?.toFixed(0) || 0}</span>
                        </div>
                        <div className="border-t border-gray-800 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Net Profit</span>
                            <span className="text-3xl font-bold text-green-400">${revenueData.totals?.profit?.toFixed(0) || 0}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          Period: {revenueData.period} | {revenueData.totals?.bets || 0} total bets
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Game Statistics Table */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Game Performance (All Time)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3">Game</th>
                          <th className="text-right py-3">Total Bets</th>
                          <th className="text-right py-3">Volume</th>
                          <th className="text-right py-3">Payout</th>
                          <th className="text-right py-3">House Edge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gameStats.map((game: any) => (
                          <tr key={game._id} className="border-b border-gray-800">
                            <td className="py-3 font-bold">{game._id}</td>
                            <td className="text-right">{game.totalBets?.toLocaleString()}</td>
                            <td className="text-right">${game.totalVolume?.toFixed(2)}</td>
                            <td className="text-right">${game.totalPayout?.toFixed(2)}</td>
                            <td className="text-right">{((game.houseEdge || 0) * 100).toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Games Configuration Tab */}
            {activeTab === 'games' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold gradient-text">Games Configuration</h2>

                <div className="grid grid-cols-2 gap-4">
                  {games.map((game: any) => (
                    <div key={game.gameType} className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{game.gameType}</h3>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={game.isEnabled}
                            onChange={(e) => updateGame(game.gameType, { isEnabled: e.target.checked })}
                            className="w-5 h-5"
                          />
                          <span className="text-sm">Enabled</span>
                        </label>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-400">House Edge (%)</label>
                          <input
                            type="number"
                            value={game.houseEdge}
                            onChange={(e) => updateGame(game.gameType, { houseEdge: parseFloat(e.target.value) })}
                            className="w-full bg-gray-800 rounded px-3 py-2 mt-1"
                            step="0.1"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-sm text-gray-400">Min Bet (USD)</label>
                            <input
                              type="number"
                              value={game.minBet?.USD || 0}
                              onChange={(e) => updateGame(game.gameType, {
                                minBet: { ...game.minBet, USD: parseFloat(e.target.value) }
                              })}
                              className="w-full bg-gray-800 rounded px-2 py-1 mt-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">Max Bet (USD)</label>
                            <input
                              type="number"
                              value={game.maxBet?.USD || 0}
                              onChange={(e) => updateGame(game.gameType, {
                                maxBet: { ...game.maxBet, USD: parseFloat(e.target.value) }
                              })}
                              className="w-full bg-gray-800 rounded px-2 py-1 mt-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">Max Win (USD)</label>
                            <input
                              type="number"
                              value={game.maxWin?.USD || 0}
                              onChange={(e) => updateGame(game.gameType, {
                                maxWin: { ...game.maxWin, USD: parseFloat(e.target.value) }
                              })}
                              className="w-full bg-gray-800 rounded px-2 py-1 mt-1 text-sm"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedGame(game)}
                          className="btn-secondary w-full text-sm"
                        >
                          Advanced Settings
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Jackpots Management Tab */}
            {activeTab === 'jackpots' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold gradient-text">Jackpot Management</h2>

                <div className="grid grid-cols-1 gap-4">
                  {jackpots.map((jackpot: any) => (
                    <div key={jackpot._id} className="card">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{jackpot.gameType || 'Global'} - {jackpot.currency || 'All'}</h3>
                          <div className="text-sm text-gray-400">Status: <span className={`font-bold ${jackpot.status === 'READY' ? 'text-green-500' :
                            jackpot.status === 'MEGA' ? 'text-yellow-500' :
                              'text-gray-500'
                            }`}>{jackpot.status}</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">${jackpot.currentAmount.toFixed(2)}</div>
                          <div className="text-sm text-gray-400">Min: ${jackpot.minAmount.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-400">Current Amount</label>
                          <input
                            type="number"
                            value={jackpot.currentAmount}
                            onChange={(e) => updateJackpot(jackpot._id, { currentAmount: parseFloat(e.target.value) })}
                            className="w-full bg-gray-800 rounded px-3 py-2 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Min Amount</label>
                          <input
                            type="number"
                            value={jackpot.minAmount}
                            onChange={(e) => updateJackpot(jackpot._id, { minAmount: parseFloat(e.target.value) })}
                            className="w-full bg-gray-800 rounded px-3 py-2 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">House Edge %</label>
                          <input
                            type="number"
                            value={jackpot.houseEdgePercent}
                            onChange={(e) => updateJackpot(jackpot._id, { houseEdgePercent: parseFloat(e.target.value) })}
                            className="w-full bg-gray-800 rounded px-3 py-2 mt-1"
                            step="0.1"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedJackpot(jackpot)}
                        className="btn-primary w-full mt-4"
                      >
                        Configure Conditions
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Management Tab - Enhanced (Phase 2) */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold gradient-text">User Management</h2>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && loadUsers()}
                    className="bg-gray-800 rounded px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Users Table */}
                  <div className="col-span-2 card">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-3">Username</th>
                            <th className="text-left py-3">Role</th>
                            <th className="text-center py-3">Status</th>
                            <th className="text-right py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user: any) => (
                            <tr
                              key={user._id}
                              className={`border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 ${selectedUser?._id === user._id ? 'bg-gray-800' : ''
                                } ${user.isBanned ? 'opacity-50' : ''}`}
                              onClick={() => loadUserDetails(user._id)}
                            >
                              <td className="py-3">
                                <div className="font-bold">{user.username}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </td>
                              <td className="py-3">
                                <select
                                  value={user.role}
                                  onChange={(e) => { e.stopPropagation(); updateUserRole(user._id, e.target.value); }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-gray-800 rounded px-2 py-1 text-sm"
                                >
                                  <option value="USER">User</option>
                                  <option value="VIP">VIP</option>
                                  <option value="PREMIUM">Premium</option>
                                  <option value="ADMIN">Admin</option>
                                </select>
                              </td>
                              <td className="text-center">
                                {user.isBanned ? (
                                  <span className="text-red-400 text-sm">🚫 Banned</span>
                                ) : user.isVip ? (
                                  <span className="text-yellow-400 text-sm">⭐ VIP</span>
                                ) : (
                                  <span className="text-green-400 text-sm">✅ Active</span>
                                )}
                              </td>
                              <td className="text-right">
                                <button
                                  onClick={(e) => { e.stopPropagation(); loadUserDetails(user._id); }}
                                  className="btn-secondary text-xs"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* User Detail Panel */}
                  <div className="col-span-1">
                    {userDetails ? (
                      <div className="card sticky top-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold">{userDetails.user?.username}</h3>
                          <button
                            onClick={() => { setUserDetails(null); setSelectedUser(null); }}
                            className="text-gray-400 hover:text-white"
                          >✕</button>
                        </div>

                        {userDetails.user?.isBanned && (
                          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4">
                            <div className="text-red-400 font-bold text-sm">🚫 BANNED</div>
                            <div className="text-xs text-gray-400">{userDetails.user?.banReason}</div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-gray-400">Total Bets</div>
                            <div className="text-lg font-bold">{userDetails.stats?.totalBets || 0}</div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-gray-400">Win Rate</div>
                            <div className="text-lg font-bold text-green-400">{userDetails.stats?.winRate || 0}%</div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-gray-400">Wagered</div>
                            <div className="text-lg font-bold">${userDetails.stats?.totalWagered?.toFixed(0) || 0}</div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-gray-400">Net P/L</div>
                            <div className={`text-lg font-bold ${(userDetails.stats?.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${userDetails.stats?.netProfit?.toFixed(0) || 0}
                            </div>
                          </div>
                        </div>

                        {/* Wallet Balances */}
                        <div className="mb-4">
                          <div className="text-sm text-gray-400 mb-2">Wallet Balances</div>
                          <div className="bg-gray-800/50 rounded-lg p-3 space-y-1">
                            {userDetails.wallet?.balances && Object.entries(userDetails.wallet.balances).length > 0 ? (
                              Object.entries(userDetails.wallet.balances).map(([currency, amount]) => (
                                <div key={currency} className="flex justify-between">
                                  <span className="text-gray-400">{currency}</span>
                                  <span className="font-bold">${Number(amount).toFixed(2)}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500">No balances</div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <button
                            onClick={() => setShowBalanceModal(true)}
                            className="btn-secondary w-full text-sm"
                          >
                            💰 Adjust Balance
                          </button>
                          <button
                            onClick={() => setShowBanModal(true)}
                            className={`w-full text-sm ${userDetails.user?.isBanned ? 'btn-primary' : 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg'}`}
                          >
                            {userDetails.user?.isBanned ? '✅ Unban User' : '🚫 Ban User'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="card text-center text-gray-500 py-12">
                        <div className="text-4xl mb-4">👤</div>
                        <div>Select a user to view details</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Balance Adjustment Modal */}
                {showBalanceModal && selectedUser && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
                      <h3 className="text-xl font-bold mb-4">💰 Adjust Balance - {selectedUser.username}</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-400">Currency</label>
                          <select
                            value={balanceAdjust.currency}
                            onChange={(e) => setBalanceAdjust(prev => ({ ...prev, currency: e.target.value }))}
                            className="w-full bg-gray-800 rounded px-3 py-2 mt-1"
                          >
                            <option value="USD">USD</option>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Amount (use negative to deduct)</label>
                          <input
                            type="number"
                            value={balanceAdjust.amount}
                            onChange={(e) => setBalanceAdjust(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-gray-800 rounded px-3 py-2 mt-1"
                            placeholder="100 or -50"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Reason (required for audit) *</label>
                          <textarea
                            value={balanceAdjust.reason}
                            onChange={(e) => setBalanceAdjust(prev => ({ ...prev, reason: e.target.value }))}
                            className="w-full bg-gray-800 rounded px-3 py-2 mt-1 h-20"
                            placeholder="Bonus credit, refund, correction..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowBalanceModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button onClick={adjustBalance} className="btn-primary flex-1">Apply</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ban Modal */}
                {showBanModal && selectedUser && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
                      <h3 className="text-xl font-bold mb-4">
                        {selectedUser.isBanned ? '✅ Unban User' : '🚫 Ban User'} - {selectedUser.username}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-400">Reason (required for audit) *</label>
                          <textarea
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            className="w-full bg-gray-800 rounded px-3 py-2 mt-1 h-20"
                            placeholder={selectedUser.isBanned ? "Reason for unbanning..." : "Reason for banning..."}
                          />
                        </div>

                        {!selectedUser.isBanned && (
                          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-400">
                            ⚠️ Banning will prevent this user from logging in and placing bets.
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button onClick={() => { setShowBanModal(false); setBanReason(''); }} className="btn-secondary flex-1">Cancel</button>
                        <button
                          onClick={banUser}
                          className={`flex-1 px-4 py-2 rounded-lg ${selectedUser.isBanned ? 'btn-primary' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                        >
                          {selectedUser.isBanned ? 'Unban' : 'Ban User'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contests Management Tab */}
            {activeTab === 'contests' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold gradient-text">Contest Management</h2>
                  <button
                    onClick={() => setNewContest({})}
                    className="btn-primary"
                  >
                    + Create Contest
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {contests.map((contest: any) => (
                    <div key={contest._id} className="card">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{contest.title}</h3>
                          <div className="text-sm text-gray-400">
                            Type: {contest.type} | Prize Pool: ${contest.prizePool}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-secondary text-sm">Edit</button>
                          <button className="btn-secondary text-sm text-red-500">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges Management Tab */}
            {activeTab === 'challenges' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold gradient-text">Challenge Management</h2>
                  <button
                    onClick={() => setShowChallengeWizard(true)}
                    className="btn-primary"
                  >
                    + Create Challenge
                  </button>
                </div>

                {/* Stats Cards */}
                {challengeStats && (
                  <div className="grid grid-cols-5 gap-4">
                    <div className="card">
                      <div className="text-sm text-gray-400">Total</div>
                      <div className="text-2xl font-bold">{challengeStats.total || 0}</div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-gray-400">Active</div>
                      <div className="text-2xl font-bold text-green-500">{challengeStats.active || 0}</div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-gray-400">Draft</div>
                      <div className="text-2xl font-bold text-yellow-500">{challengeStats.draft || 0}</div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-gray-400">Completed</div>
                      <div className="text-2xl font-bold text-blue-500">{challengeStats.completed || 0}</div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-gray-400">Cancelled</div>
                      <div className="text-2xl font-bold text-red-500">{challengeStats.cancelled || 0}</div>
                    </div>
                  </div>
                )}

                {/* Challenge Wizard Modal */}
                {showChallengeWizard && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <h3 className="text-2xl font-bold gradient-text mb-6">🏆 Create New Challenge</h3>

                      {/* Basic Info */}
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="text-sm text-gray-400">Title</label>
                          <input
                            type="text"
                            value={newChallenge.title}
                            onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                            className="w-full bg-gray-800 rounded px-3 py-2 mt-1"
                            placeholder="Challenge title"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Description</label>
                          <textarea
                            value={newChallenge.description}
                            onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                            className="w-full bg-gray-800 rounded px-3 py-2 mt-1"
                            placeholder="Challenge description"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Step 1: Games */}
                      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-bold mb-3">Step 1: Choose Games</h4>
                        <div className="flex flex-wrap gap-2">
                          {['DICE', 'LIMBO', 'CRASH', 'MINES', 'PLINKO', 'ROULETTE', 'KENO', 'TOWER', 'HILO', 'BLACKJACK', 'WHEEL', 'BALLOON', 'COINFLIP'].map(game => (
                            <button
                              key={game}
                              onClick={() => {
                                const games = newChallenge.games.includes(game)
                                  ? newChallenge.games.filter((g: string) => g !== game)
                                  : [...newChallenge.games, game];
                                setNewChallenge({ ...newChallenge, games });
                              }}
                              className={`px-3 py-1 rounded text-sm ${newChallenge.games.includes(game)
                                ? 'bg-primary text-black font-bold'
                                : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                              {game}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 2: Minimum Bet */}
                      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-bold mb-3">Step 2: Minimum Bet Amount</h4>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-sm text-gray-400">Amount</label>
                            <input
                              type="number"
                              value={newChallenge.minBetAmount}
                              onChange={(e) => setNewChallenge({ ...newChallenge, minBetAmount: parseFloat(e.target.value) })}
                              className="w-full bg-gray-700 rounded px-3 py-2 mt-1"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">Currency</label>
                            <select
                              value={newChallenge.currency}
                              onChange={(e) => setNewChallenge({ ...newChallenge, currency: e.target.value })}
                              className="bg-gray-700 rounded px-3 py-2 mt-1"
                            >
                              <option value="USD">USD</option>
                              <option value="BTC">BTC</option>
                              <option value="ETH">ETH</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Conditions */}
                      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-bold mb-3">Step 3: Win Conditions</h4>
                        <div className="space-y-4">
                          {newChallenge.conditions.map((condition: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-end">
                              <div className="flex-1">
                                <label className="text-sm text-gray-400">Type</label>
                                <select
                                  value={condition.type}
                                  onChange={(e) => {
                                    const conditions = [...newChallenge.conditions];
                                    conditions[idx] = { ...condition, type: e.target.value };
                                    setNewChallenge({ ...newChallenge, conditions });
                                  }}
                                  className="w-full bg-gray-700 rounded px-3 py-2 mt-1"
                                >
                                  <option value="WIN_X_IN_ROW">Win X Times in a Row</option>
                                  <option value="LOSE_X_IN_ROW">Lose X Times in a Row</option>
                                  <option value="WAGER_X_IN_ROW">Wager X Times in a Row</option>
                                  <option value="HIT_MULTIPLIER">Hit Specific Multiplier</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-sm text-gray-400">Count</label>
                                <input
                                  type="number"
                                  value={condition.count || 1}
                                  onChange={(e) => {
                                    const conditions = [...newChallenge.conditions];
                                    conditions[idx] = { ...condition, count: parseInt(e.target.value) };
                                    setNewChallenge({ ...newChallenge, conditions });
                                  }}
                                  className="w-20 bg-gray-700 rounded px-3 py-2 mt-1"
                                  min={1}
                                />
                              </div>
                              {newChallenge.conditions.length > 1 && (
                                <button
                                  onClick={() => {
                                    const conditions = newChallenge.conditions.filter((_: any, i: number) => i !== idx);
                                    setNewChallenge({ ...newChallenge, conditions });
                                  }}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prize */}
                      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-bold mb-3">Prize</h4>
                        <div className="flex gap-4">
                          <div>
                            <label className="text-sm text-gray-400">Type</label>
                            <select
                              value={newChallenge.prize.type}
                              onChange={(e) => setNewChallenge({ ...newChallenge, prize: { ...newChallenge.prize, type: e.target.value } })}
                              className="bg-gray-700 rounded px-3 py-2 mt-1"
                            >
                              <option value="FIXED">Fixed Amount</option>
                              <option value="POOL">Prize Pool</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="text-sm text-gray-400">Amount</label>
                            <input
                              type="number"
                              value={newChallenge.prize.amount}
                              onChange={(e) => setNewChallenge({ ...newChallenge, prize: { ...newChallenge.prize, amount: parseFloat(e.target.value) } })}
                              className="w-full bg-gray-700 rounded px-3 py-2 mt-1"
                              min={0}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Winners */}
                      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-bold mb-3">Winners</h4>
                        <div className="flex gap-4">
                          <div>
                            <label className="text-sm text-gray-400">Type</label>
                            <select
                              value={newChallenge.winners.type}
                              onChange={(e) => setNewChallenge({ ...newChallenge, winners: { ...newChallenge.winners, type: e.target.value } })}
                              className="bg-gray-700 rounded px-3 py-2 mt-1"
                            >
                              <option value="FIRST_X">First X to Complete</option>
                              <option value="TOP_X_IN_DURATION">Top X within Duration</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">Count</label>
                            <input
                              type="number"
                              value={newChallenge.winners.count}
                              onChange={(e) => setNewChallenge({ ...newChallenge, winners: { ...newChallenge.winners, count: parseInt(e.target.value) } })}
                              className="w-20 bg-gray-700 rounded px-3 py-2 mt-1"
                              min={1}
                            />
                          </div>
                          {newChallenge.winners.type === 'TOP_X_IN_DURATION' && (
                            <div>
                              <label className="text-sm text-gray-400">Hours</label>
                              <input
                                type="number"
                                value={newChallenge.winners.duration || 24}
                                onChange={(e) => setNewChallenge({ ...newChallenge, winners: { ...newChallenge.winners, duration: parseInt(e.target.value) } })}
                                className="w-20 bg-gray-700 rounded px-3 py-2 mt-1"
                                min={1}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-bold mb-3">Schedule</h4>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-sm text-gray-400">Start Time</label>
                            <input
                              type="datetime-local"
                              value={newChallenge.startTime}
                              onChange={(e) => setNewChallenge({ ...newChallenge, startTime: e.target.value })}
                              className="w-full bg-gray-700 rounded px-3 py-2 mt-1"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm text-gray-400">End Time</label>
                            <input
                              type="datetime-local"
                              value={newChallenge.endTime}
                              onChange={(e) => setNewChallenge({ ...newChallenge, endTime: e.target.value })}
                              className="w-full bg-gray-700 rounded px-3 py-2 mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => setShowChallengeWizard(false)}
                          className="btn-secondary flex-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={createChallenge}
                          className="btn-primary flex-1"
                          disabled={!newChallenge.title || newChallenge.games.length === 0}
                        >
                          Create Challenge
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Challenges List */}
                <div className="space-y-4">
                  {challenges.map((challenge: any) => (
                    <div key={challenge._id} className="card">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold">{challenge.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${challenge.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' :
                              challenge.status === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-500' :
                                challenge.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-500' :
                                  'bg-red-500/20 text-red-500'
                              }`}>
                              {challenge.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Games: {challenge.games?.join(', ')} |
                            Min Bet: ${challenge.minBetAmount} |
                            Prize: ${challenge.prize?.amount}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {new Date(challenge.startTime).toLocaleString()} - {new Date(challenge.endTime).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {challenge.status === 'DRAFT' && (
                            <>
                              <button
                                onClick={() => activateChallenge(challenge._id)}
                                className="btn-primary text-sm"
                              >
                                Activate
                              </button>
                              <button
                                onClick={() => deleteChallenge(challenge._id)}
                                className="btn-secondary text-sm text-red-500"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {challenge.status === 'ACTIVE' && (
                            <button
                              onClick={() => {
                                const reason = prompt('Enter reason for cancellation:');
                                if (reason) cancelChallenge(challenge._id, reason);
                              }}
                              className="btn-secondary text-sm text-red-500"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {challenges.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No challenges yet. Create your first challenge!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold gradient-text">Activity Logs</h2>

                {/* Stats */}
                {logStats && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="card">
                      <div className="text-sm text-gray-400">Total Actions (7 days)</div>
                      <div className="text-2xl font-bold">{logStats.totalActions || 0}</div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-gray-400">Recent Sensitive Actions</div>
                      <div className="text-2xl font-bold text-red-500">{logStats.recentSensitive?.length || 0}</div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-gray-400">Active Admins</div>
                      <div className="text-2xl font-bold text-green-500">{logStats.actionsByAdmin?.length || 0}</div>
                    </div>
                  </div>
                )}

                {/* Logs Table */}
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3">Time</th>
                          <th className="text-left py-3">Admin</th>
                          <th className="text-left py-3">Action</th>
                          <th className="text-left py-3">Target</th>
                          <th className="text-left py-3">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLogs.map((log: any) => (
                          <tr key={log._id} className="border-b border-gray-800">
                            <td className="py-3 text-sm text-gray-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="py-3 font-bold">{log.adminUsername}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-xs ${log.action.includes('BAN') || log.action.includes('DELETE') ? 'bg-red-500/20 text-red-500' :
                                log.action.includes('CREATE') ? 'bg-green-500/20 text-green-500' :
                                  'bg-blue-500/20 text-blue-500'
                                }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="py-3 text-gray-400">
                              {log.targetType}: {log.targetName || log.targetId}
                            </td>
                            <td className="py-3 text-sm text-gray-500">
                              {log.reason || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {activityLogs.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No activity logs yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold gradient-text">Platform Settings</h2>

                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Global Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Default House Edge (%)</label>
                      <input type="number" className="w-full bg-gray-800 rounded px-3 py-2 mt-1" defaultValue="1.0" step="0.1" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Max Bet Multiplier</label>
                      <input type="number" className="w-full bg-gray-800 rounded px-3 py-2 mt-1" defaultValue="10000" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Jackpot Contribution (%)</label>
                      <input type="number" className="w-full bg-gray-800 rounded px-3 py-2 mt-1" defaultValue="0.1" step="0.01" />
                    </div>
                    <button className="btn-primary w-full">Save Settings</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}