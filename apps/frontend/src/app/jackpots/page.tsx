'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function JackpotHistoryPage() {
  const [winners, setWinners] = useState<any[]>([]);
  const [jackpots, setJackpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [winnersRes, jackpotsRes] = await Promise.all([
        fetch(`${API_URL}/api/jackpot/winners`),
        fetch(`${API_URL}/api/jackpot/all`)
      ]);
      
      setWinners(await winnersRes.json());
      setJackpots(await jackpotsRes.json());
    } catch (error) {
      toast.error('Failed to load jackpot data');
    } finally {
      setLoading(false);
    }
  };

  const filteredWinners = filter === 'all' 
    ? winners 
    : winners.filter(w => w.jackpot?.gameType === filter);

  const totalWon = winners.reduce((sum, w) => sum + w.amount, 0);
  const biggestWin = winners.length > 0 ? Math.max(...winners.map(w => w.amount)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl gradient-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold gradient-text">← Back</Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold gradient-text mb-12 text-center">🎰 Jackpot History</h1>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="card text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-sm text-gray-400">Total Won</div>
            <div className="text-3xl font-bold text-primary">${totalWon.toFixed(2)}</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-sm text-gray-400">Biggest Win</div>
            <div className="text-3xl font-bold text-secondary">${biggestWin.toFixed(2)}</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-sm text-gray-400">Winners</div>
            <div className="text-3xl font-bold text-special">{winners.length}</div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Current Jackpots</h2>
          <div className="grid grid-cols-3 gap-4">
            {jackpots.map((j) => (
              <div key={j._id} className="card">
                <div className="flex justify-between mb-2">
                  <div className="font-bold">{j.gameType || 'Global'}</div>
                  <div className={`text-xs px-2 py-1 rounded ${j.status === 'MEGA' ? 'bg-yellow-500 text-black' : j.status === 'READY' ? 'bg-green-500 text-black' : 'bg-gray-700'}`}>
                    {j.status}
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">${j.currentAmount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Recent Winners</h2>
          {filteredWinners.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🎰</div>
              <div className="text-xl">No winners yet!</div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWinners.map((w, i) => (
                <div key={w._id} className="flex justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex gap-4">
                    <div className="text-2xl font-bold text-gray-600">#{i + 1}</div>
                    <div>
                      <div className="font-bold text-lg">{w.userId?.username || 'Anonymous'}</div>
                      <div className="text-sm text-gray-400">{w.jackpot?.gameType || 'Unknown'} • {w.currency}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-500">${w.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}