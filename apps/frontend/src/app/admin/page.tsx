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
  
  // Contests Management
  const [contests, setContests] = useState<any[]>([]);
  const [newContest, setNewContest] = useState<any>(null);

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
        loadContests()
      ]);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [statsRes, gameStatsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/admin/stats/games`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setStats(await statsRes.json());
      setGameStats(await gameStatsRes.json());
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
                  { id: 'contests', label: '🏆 Contests', icon: '🏆' },
                  { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
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
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold gradient-text">Platform Statistics</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="card">
                    <div className="text-sm text-gray-400">Total Users</div>
                    <div className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-gray-400">Total Bets</div>
                    <div className="text-3xl font-bold text-secondary">{stats?.totalBets || 0}</div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-gray-400">Total Volume</div>
                    <div className="text-3xl font-bold text-special">${(stats?.totalVolume || 0).toFixed(2)}</div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-gray-400">Active Jackpots</div>
                    <div className="text-3xl font-bold text-alt">{stats?.activeJackpots || 0}</div>
                  </div>
                </div>

                {/* Game Statistics */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Game Performance</h3>
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
                            <td className="text-right">{game.totalBets}</td>
                            <td className="text-right">${game.totalVolume.toFixed(2)}</td>
                            <td className="text-right">${game.totalPayout.toFixed(2)}</td>
                            <td className="text-right">{(game.houseEdge * 100).toFixed(2)}%</td>
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
                          <div className="text-sm text-gray-400">Status: <span className={`font-bold ${
                            jackpot.status === 'READY' ? 'text-green-500' :
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

            {/* Users Management Tab */}
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
                
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3">Username</th>
                          <th className="text-left py-3">Email</th>
                          <th className="text-left py-3">Role</th>
                          <th className="text-center py-3">VIP</th>
                          <th className="text-center py-3">Premium</th>
                          <th className="text-right py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user: any) => (
                          <tr key={user._id} className="border-b border-gray-800">
                            <td className="py-3 font-bold">{user.username}</td>
                            <td className="py-3 text-gray-400">{user.email}</td>
                            <td className="py-3">
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user._id, e.target.value)}
                                className="bg-gray-800 rounded px-2 py-1 text-sm"
                              >
                                <option value="USER">User</option>
                                <option value="VIP">VIP</option>
                                <option value="PREMIUM">Premium</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            </td>
                            <td className="text-center">{user.isVip ? '✅' : '❌'}</td>
                            <td className="text-center">{user.isPremium ? '✅' : '❌'}</td>
                            <td className="text-right">
                              <button className="btn-secondary text-sm">View Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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