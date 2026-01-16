'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { betAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyModal, setVerifyModal] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const response = await betAPI.getHistory(50, 0);
      setBets(response.data.bets);
    } catch (error) {
      toast.error('Failed to load bet history');
    } finally {
      setLoading(false);
    }
  };

  const verifyBet = async (bet: any) => {
    try {
      const response = await betAPI.verify(bet._id);
      setVerifyModal(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Verification failed');
    }
  };

  const openVerifier = (bet: any) => {
    const seedPair = bet.seedPairId;
    if (!seedPair?.revealed) {
      toast.error('Rotate your seed pair first to reveal the server seed');
      return;
    }
    
    const params = new URLSearchParams({
      serverSeed: seedPair.serverSeed,
      clientSeed: seedPair.clientSeed,
      nonce: (bet.nonce + 1).toString(),
      gameType: bet.gameType,
    });
    
    window.open(`/verifier?${params.toString()}`, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <Link href="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold gradient-text">
            ← Bet History
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="card">
          <h1 className="text-3xl font-bold mb-6 gradient-text">Your Bet History</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : bets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xl mb-4">No bets yet</p>
              <Link href="/" className="btn-primary">
                Start Playing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-3">Game</th>
                    <th className="text-left p-3">Amount</th>
                    <th className="text-left p-3">Multiplier</th>
                    <th className="text-left p-3">Payout</th>
                    <th className="text-left p-3">Result</th>
                    <th className="text-left p-3">Time</th>
                    <th className="text-left p-3">Verify</th>
                  </tr>
                </thead>
                <tbody>
                  {bets.map((bet) => (
                    <tr key={bet._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-3">
                        <div className="font-bold">{bet.gameType}</div>
                        <div className="text-xs text-gray-500">Nonce: {bet.nonce + 1}</div>
                      </td>
                      <td className="p-3">
                        {bet.amount} {bet.currency}
                      </td>
                      <td className="p-3">
                        <span className={bet.multiplier >= 2 ? 'text-green-500' : 'text-gray-400'}>
                          {bet.multiplier.toFixed(2)}x
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={bet.status === 'WON' ? 'text-green-500' : 'text-gray-400'}>
                          {bet.payout.toFixed(2)} {bet.currency}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          bet.status === 'WON' 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {bet.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-400">
                        {new Date(bet.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => verifyBet(bet)}
                            className="text-primary hover:text-primary-light text-sm"
                            title="Quick verify"
                          >
                            🔍
                          </button>
                          <button
                            onClick={() => openVerifier(bet)}
                            className="text-secondary hover:text-secondary-light text-sm"
                            title="Open in verifier"
                          >
                            🔗
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {verifyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">Bet Verification</h2>
                <button onClick={() => setVerifyModal(null)} className="text-gray-400 hover:text-white text-2xl">
                  ×
                </button>
              </div>

              {!verifyModal.canVerify ? (
                <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
                  <div className="font-bold text-yellow-500 mb-2">⚠️ Cannot Verify Yet</div>
                  <p className="text-gray-400">{verifyModal.message}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Match Status */}
                  <div className={`border rounded-lg p-4 ${
                    verifyModal.matches 
                      ? 'bg-green-900/20 border-green-500' 
                      : 'bg-red-900/20 border-red-500'
                  }`}>
                    <div className={`font-bold text-xl mb-2 ${
                      verifyModal.matches ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {verifyModal.matches ? '✅ Verification Passed' : '❌ Verification Failed'}
                    </div>
                    <p className="text-sm text-gray-400">
                      {verifyModal.matches 
                        ? 'The bet result matches the provably fair calculation' 
                        : 'Warning: Result mismatch detected'}
                    </p>
                  </div>

                  {/* Bet Info */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Bet Information</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-400">Game</div>
                        <div className="font-bold">{verifyModal.bet.gameType}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Amount</div>
                        <div className="font-bold">{verifyModal.bet.amount}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Multiplier</div>
                        <div className="font-bold">{verifyModal.bet.multiplier.toFixed(2)}x</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Payout</div>
                        <div className="font-bold">{verifyModal.bet.payout.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Seed Data */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Seed Data</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="text-gray-400">Server Seed</div>
                        <div className="font-mono text-xs break-all">{verifyModal.seedData.serverSeed}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Client Seed</div>
                        <div className="font-mono text-xs break-all">{verifyModal.seedData.clientSeed}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Nonce</div>
                        <div className="font-mono">{verifyModal.seedData.nonce + 1}</div>
                      </div>
                    </div>
                  </div>

                  {/* Results Comparison */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Result Comparison</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-gray-400 text-sm mb-2">Original Result</div>
                        <pre className="bg-gray-900 p-2 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(verifyModal.bet.result, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-2">Verified Result</div>
                        <pre className="bg-gray-900 p-2 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(verifyModal.verification.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Link href="/verifier" className="btn-primary w-full block text-center">
                    Open Full Verifier
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
