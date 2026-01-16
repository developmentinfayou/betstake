'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import Link from 'next/link';
import toast from 'react-hot-toast';
import FastParityGameControls, { FastParityGameParams } from '@/components/games/fastparity/FastParityGameControls';
import FairnessModal from '@/components/games/FairnessModal';

interface RoundState {
  roundId: string;
  status: 'betting' | 'closed' | 'completed';
  timeLeft: number;
  bets: Array<{
    userId: string;
    username: string;
    betType: 'number' | 'color';
    value: number | string;
    amount: number;
  }>;
  totalAmount: number;
  playerCount: number;
}

interface RoundResult {
  roundId: string;
  number: number;
  color: 'green' | 'red' | 'violet';
  bets: Array<{
    userId: string;
    username: string;
    betType: 'number' | 'color';
    value: number | string;
    amount: number;
    multiplier: number;
    payout: number;
    won: boolean;
  }>;
}

interface HistoryItem {
  roundId: string;
  number: number;
  color: 'green' | 'red' | 'violet';
  createdAt: string;
}

export default function FastParityPage() {
  const [amount, setAmount] = useState(10);
  const [gameParams, setGameParams] = useState<FastParityGameParams>({ betType: 'color', value: 'green' });
  const [currentRound, setCurrentRound] = useState<RoundState | null>(null);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'continuous' | 'record' | 'probability'>('continuous');
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [showResult, setShowResult] = useState(false);

  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
      setUsername(payload.username);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit('fastparity:join');

    socket.on('round:current', (data: RoundState) => {
      setCurrentRound(data);
    });

    socket.on('round:started', (data: { roundId: string; timeLeft: number; status: string }) => {
      setCurrentRound(prev => prev ? { ...prev, ...data } : null);
      setShowResult(false);
    });

    socket.on('round:timer', (data: { timeLeft: number }) => {
      setCurrentRound(prev => prev ? { ...prev, timeLeft: data.timeLeft } : null);
    });

    socket.on('round:betting_closed', () => {
      setCurrentRound(prev => prev ? { ...prev, status: 'closed' } : null);
    });

    socket.on('round:bets_updated', (data: { bets: any[]; totalAmount: number; playerCount: number }) => {
      setCurrentRound(prev => prev ? { ...prev, ...data } : null);
    });

    socket.on('round:result', (result: RoundResult) => {
      setLastResult(result);
      setShowResult(true);
      
      // Add to history
      setHistory(prev => [{
        roundId: result.roundId,
        number: result.number,
        color: result.color,
        createdAt: new Date().toISOString()
      }, ...prev.slice(0, 49)]);

      // Check if user won
      const userBet = result.bets.find(bet => bet.userId === userId);
      if (userBet) {
        if (userBet.won) {
          toast.success(`Won ₹${userBet.payout.toFixed(2)}!`);
        } else {
          toast.error(`Lost ₹${userBet.amount}`);
        }
      }
    });

    socket.on('history:data', (data: HistoryItem[]) => {
      setHistory(data);
    });

    socket.emit('fastparity:history');

    return () => {
      socket.off('round:current');
      socket.off('round:started');
      socket.off('round:timer');
      socket.off('round:betting_closed');
      socket.off('round:bets_updated');
      socket.off('round:result');
      socket.off('history:data');
      socket.emit('fastparity:leave');
    };
  }, [socket, userId]);

  const placeBet = () => {
    if (!socket || !userId || !username || !currentRound || currentRound.status !== 'betting') {
      toast.error('Cannot place bet right now');
      return;
    }

    socket.emit('fastparity:bet', {
      userId,
      username,
      betType: gameParams.betType,
      value: gameParams.value,
      amount
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  const getColorStyle = (color: string) => {
    const colors: any = { green: '#10b981', red: '#ef4444', violet: '#8b5cf6' };
    return { backgroundColor: colors[color] || '#gray' };
  };

  const canBet = currentRound?.status === 'betting' && currentRound.timeLeft > 0;

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">← Fast Parity</Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setFairnessModalOpen(true)} className="btn-secondary px-4 py-2">🎲 Fairness</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <div className="card">
              {/* Timer and Round Info */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2">
                  {currentRound ? formatTime(currentRound.timeLeft) : '00 : 00'}
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  Round: {currentRound?.roundId || 'Loading...'}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      canBet ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: currentRound ? `${(currentRound.timeLeft / 30) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
                
                <div className="text-lg font-bold">
                  {canBet ? 'Place your bets' : currentRound?.status === 'closed' ? 'No more bets' : 'Waiting...'}
                </div>
              </div>

              {/* Result Display */}
              {showResult && lastResult && (
                <div className="mb-6 p-6 rounded-lg text-center bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-500">
                  <div className="text-2xl font-bold mb-4">WINNING NUMBER</div>
                  <div 
                    className="text-6xl font-bold mb-2 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white animate-bounce" 
                    style={getColorStyle(lastResult.color)}
                  >
                    {lastResult.number}
                  </div>
                  <div className="text-xl capitalize">{lastResult.color}</div>
                </div>
              )}

              {/* Game Controls */}
              <FastParityGameControls onChange={setGameParams} disabled={!canBet} />

              {/* Bet Button */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">Bet Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    min="1"
                    disabled={!canBet}
                  />
                </div>
                <button
                  onClick={placeBet}
                  disabled={!canBet}
                  className={`px-8 py-3 rounded-lg font-bold text-lg ${
                    canBet 
                      ? 'bg-primary hover:bg-primary/80 text-white' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canBet ? 'Place Bet' : 'Betting Closed'}
                </button>
              </div>
            </div>

            {/* History */}
            <div className="card mt-6">
              <div className="flex gap-4 mb-4">
                {(['continuous', 'record', 'probability'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-bold capitalize ${
                      activeTab === tab ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'continuous' && (
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Old</span>
                    <span>New</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {history.slice(0, 40).reverse().map((item, index) => (
                      <div
                        key={item.roundId}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={getColorStyle(item.color)}
                      >
                        {item.number}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'record' && (
                <div className="grid grid-cols-10 gap-2">
                  {history.map((item, index) => (
                    <div key={item.roundId} className="text-center">
                      <div className="text-xs text-gray-400 mb-1">
                        {item.roundId.slice(-4)}
                      </div>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto"
                        style={getColorStyle(item.color)}
                      >
                        {item.number}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'probability' && (
                <div className="text-center py-8 text-gray-400">
                  Probability analysis coming soon...
                </div>
              )}
            </div>
          </div>

          {/* Player List */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">
              {currentRound?.playerCount || 0} Player
            </h3>
            <div className="text-lg font-bold mb-4">
              ₹{currentRound?.totalAmount?.toFixed(2) || '0.00'}
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 font-bold">
                <span>User</span>
                <span>Select</span>
                <span>Bet Amount</span>
                <span>Profit</span>
              </div>
              
              {currentRound?.bets.map((bet, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-gray-800">
                  <span className="truncate">{bet.username}</span>
                  <span className="capitalize">
                    {bet.betType === 'color' ? bet.value : `#${bet.value}`}
                  </span>
                  <span>₹{bet.amount}</span>
                  <span className="text-gray-400">-</span>
                </div>
              ))}
              
              {(!currentRound?.bets || currentRound.bets.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  No bets yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FairnessModal isOpen={fairnessModalOpen} onClose={() => setFairnessModalOpen(false)} />
    </div>
  );
}