'use client';

import { useState, useEffect } from 'react';
import { seedAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface FairnessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FairnessModal({ isOpen, onClose }: FairnessModalProps) {
  const [seedData, setSeedData] = useState<any>(null);
  const [newClientSeed, setNewClientSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasActiveGame, setHasActiveGame] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSeedData();
    }
  }, [isOpen]);

  const loadSeedData = async () => {
    try {
      const response = await seedAPI.getActive();
      setSeedData(response.data);
      setNewClientSeed(response.data.clientSeed);
      setHasActiveGame(!!response.data.activeGameSession);
    } catch (error) {
      toast.error('Failed to load seed data');
    }
  };

  const handleRotateSeed = async () => {
    if (hasActiveGame) {
      toast.error('Cannot rotate seed during active game session');
      return;
    }
    setLoading(true);
    try {
      const response = await seedAPI.rotate();
      const { oldSeed, newSeed } = response.data;
      
      // Show revealed server seed
      toast.success(
        <div>
          <div className="font-bold mb-2">Seed Rotated!</div>
          <div className="text-xs">Old Server Seed Revealed:</div>
          <div className="font-mono text-xs break-all">{oldSeed.serverSeed}</div>
        </div>,
        { duration: 10000 }
      );
      
      await loadSeedData();
    } catch (error) {
      toast.error('Failed to rotate seed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClientSeed = async () => {
    if (!newClientSeed || newClientSeed === seedData?.clientSeed) return;
    
    setLoading(true);
    try {
      await seedAPI.updateClientSeed(newClientSeed);
      toast.success('Client seed updated');
      await loadSeedData();
    } catch (error) {
      toast.error('Failed to update client seed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gradient-text">Provably Fair</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
              ×
            </button>
          </div>

          {seedData && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className={`border rounded-lg p-3 flex items-center justify-between ${
                hasActiveGame 
                  ? 'bg-yellow-900/20 border-yellow-500' 
                  : 'bg-green-900/20 border-green-500'
              }`}>
                <div>
                  <div className={`font-bold ${
                    hasActiveGame ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {hasActiveGame ? '🔒 Seed Locked' : 'Active Seed Pair'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {hasActiveGame 
                      ? 'Complete your game to unlock' 
                      : `${seedData.betCount || 0} bets placed`
                    }
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  hasActiveGame 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-green-500 text-white'
                }`}>
                  {hasActiveGame ? 'LOCKED' : 'ACTIVE'}
                </div>
              </div>

              {/* Server Seed Hash */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Server Seed Hash (SHA-256)
                </label>
                <div className="bg-gray-800 p-3 rounded-lg font-mono text-sm break-all">
                  {seedData.serverSeedHash}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Server seed is HIDDEN until you rotate. This hash proves it was generated before your bets.
                </p>
              </div>

              {/* Client Seed */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Client Seed (Your Seed)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newClientSeed}
                    onChange={(e) => setNewClientSeed(e.target.value)}
                    className="input flex-1"
                    placeholder="Enter your custom seed"
                  />
                  <button
                    onClick={handleUpdateClientSeed}
                    disabled={loading || newClientSeed === seedData.clientSeed}
                    className="btn-primary px-4 disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Change this to influence the randomness. Updates will rotate your seed pair.
                </p>
              </div>

              {/* Nonce */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Nonce (Bet Counter)
                </label>
                <div className="bg-gray-800 p-3 rounded-lg font-mono text-sm">
                  {(seedData.nonce || 0) + 1}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Next bet will use nonce {(seedData.nonce || 0) + 1}. Starts from 1 for first bet.
                </p>
              </div>

              {/* Rotate Seed */}
              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                <h3 className="font-bold mb-2">Rotate Seed Pair</h3>
                {hasActiveGame && (
                  <div className="bg-red-900/20 border border-red-500 p-3 rounded mb-3">
                    <div className="text-red-500 font-bold mb-1">⚠️ Cannot Rotate</div>
                    <div className="text-sm text-gray-400">
                      You have an active game session. Complete or cashout your current game before rotating seeds.
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-400 mb-3">
                  Rotating will reveal your current server seed and generate a new seed pair.
                  This allows you to verify all previous bets.
                </p>
                <button
                  onClick={handleRotateSeed}
                  disabled={loading || hasActiveGame}
                  className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Rotating...' : hasActiveGame ? 'Locked During Game' : 'Rotate Seed Pair'}
                </button>
              </div>

              {/* How It Works */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-bold mb-2">How Provably Fair Works</h3>
                <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                  <li>Server generates a random seed and shows you its hash</li>
                  <li>You provide your own client seed (or use auto-generated)</li>
                  <li>Each bet combines: serverSeed + clientSeed + nonce</li>
                  <li>HMAC-SHA256 generates the random outcome</li>
                  <li>After rotating, you can verify all past bets</li>
                </ol>
                
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded">
                  <div className="text-xs text-yellow-400">
                    <strong>Note:</strong> Some games (Mines, Tower, Stairs, HiLo, Blackjack) use session-based gameplay but still use the same provably fair system for their random elements.
                  </div>
                </div>
              </div>

              {/* Verifier Link */}
              <a
                href="/verifier"
                className="block text-center btn-primary py-3"
                onClick={onClose}
              >
                Open Bet Verifier
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
