'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface JackpotDisplayProps {
  gameType?: string;
  currency?: string;
}

export default function JackpotDisplay({ gameType, currency }: JackpotDisplayProps) {
  const [jackpot, setJackpot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJackpot();
    const interval = setInterval(loadJackpot, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [gameType, currency]);

  const loadJackpot = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jackpot?gameType=${gameType || ''}&currency=${currency || ''}`);
      const data = await res.json();
      setJackpot(data);
    } catch (error) {
      console.error('Failed to load jackpot:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !jackpot) return null;

  const getStatusColor = () => {
    switch (jackpot.status) {
      case 'MEGA': return 'from-yellow-500 to-orange-500';
      case 'READY': return 'from-green-500 to-emerald-500';
      case 'REFILLING': return 'from-gray-500 to-gray-600';
      default: return 'from-primary to-secondary';
    }
  };

  const getStatusIcon = () => {
    switch (jackpot.status) {
      case 'MEGA': return '🔥';
      case 'READY': return '💎';
      case 'REFILLING': return '⏳';
      default: return '🎰';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${getStatusColor()} p-[2px]`}>
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getStatusIcon()}</span>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Jackpot</div>
              <div className="text-sm font-bold text-gray-300">{jackpot.status}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold bg-gradient-to-r ${getStatusColor()} bg-clip-text text-transparent`}>
              ${jackpot.currentAmount.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">
              Min: ${jackpot.minAmount.toFixed(2)}
            </div>
          </div>
        </div>
        
        {jackpot.status === 'MEGA' && (
          <div className="mt-2 text-center">
            <div className="text-xs font-bold text-yellow-500 animate-pulse">
              🌟 MEGA JACKPOT ACTIVE! 🌟
            </div>
          </div>
        )}
      </div>
    </div>
  );
}