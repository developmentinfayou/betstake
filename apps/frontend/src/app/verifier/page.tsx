'use client';

import { useState } from 'react';
import Link from 'next/link';
import { verifyGame, verifyServerSeedHash, VerificationInput } from '@casino/fairness/verifier';

export default function VerifierPage() {
  const [serverSeed, setServerSeed] = useState('');
  const [clientSeed, setClientSeed] = useState('');
  const [nonce, setNonce] = useState(1);
  const [gameType, setGameType] = useState('DICE');
  const [gameParams, setGameParams] = useState<any>({});
  const [result, setResult] = useState<any>(null);

  const verifyBet = () => {
    if (!serverSeed || !clientSeed) {
      alert('Please enter server seed and client seed');
      return;
    }

    try {
      const input: VerificationInput = {
        serverSeed,
        clientSeed,
        nonce: nonce - 1, // Convert to 0-based
        gameType,
        gameParams,
      };

      const verification = verifyGame(input);
      setResult(verification);
    } catch (error: any) {
      alert(`Verification error: ${error.message}`);
    }
  };

  const checkServerSeedHash = () => {
    if (!serverSeed) {
      alert('Please enter server seed');
      return;
    }
    
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(serverSeed).digest('hex');
    alert(`Server Seed Hash:\n${hash}`);
  };

  const updateGameParams = (key: string, value: any) => {
    setGameParams({ ...gameParams, [key]: value });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold gradient-text">
            ← Bet Verifier
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="card">
          <h1 className="text-3xl font-bold mb-6 gradient-text">Provably Fair Verifier</h1>
          
          <p className="text-gray-400 mb-6">
            Verify any bet by entering the seed data. After rotating your seed pair,
            you can use the revealed server seed to verify all previous bets were fair.
          </p>

          <div className="space-y-6">
            {/* Server Seed */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Server Seed (Revealed after rotation)
              </label>
              <input
                type="text"
                value={serverSeed}
                onChange={(e) => setServerSeed(e.target.value)}
                className="input w-full font-mono"
                placeholder="Enter server seed..."
              />
              <button
                onClick={checkServerSeedHash}
                className="btn-secondary mt-2"
              >
                Verify Server Seed Hash
              </button>
            </div>

            {/* Client Seed */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Client Seed
              </label>
              <input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="input w-full font-mono"
                placeholder="Enter client seed..."
              />
            </div>

            {/* Nonce */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Nonce (Bet Number)
              </label>
              <input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(parseInt(e.target.value) || 1)}
                className="input w-full"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                First bet uses nonce 1, second bet uses nonce 2, etc.
              </p>
            </div>

            {/* Game Type */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Game Type
              </label>
              <select
                value={gameType}
                onChange={(e) => {
                  setGameType(e.target.value);
                  setGameParams({});
                }}
                className="input w-full"
              >
                <option value="DICE">Dice</option>
                <option value="LIMBO">Limbo</option>
                <option value="CRASH">Crash</option>
                <option value="SOLOCRASH">Solo Crash</option>
                <option value="MINES">Mines</option>
                <option value="PLINKO">Plinko</option>
                <option value="ROULETTE">Roulette</option>
                <option value="FASTPARITY">Fast Parity</option>
                <option value="KENO">Keno</option>
                <option value="TOWER">Tower</option>
                <option value="HILO">HiLo</option>
                <option value="BLACKJACK">Blackjack</option>
                <option value="WHEEL">Wheel</option>
                <option value="BALLOON">Balloon</option>
                <option value="RUSH">Rush</option>
                <option value="COINFLIP">Coin Flip</option>
                <option value="STAIRS">Stairs</option>
              </select>
            </div>

            {/* Game-Specific Parameters */}
            {gameType === 'MINES' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Grid Size</label>
                  <select
                    value={gameParams.gridSize || 25}
                    onChange={(e) => updateGameParams('gridSize', parseInt(e.target.value))}
                    className="input w-full"
                  >
                    <option value="16">4x4 (16)</option>
                    <option value="25">5x5 (25)</option>
                    <option value="36">6x6 (36)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Mines Count</label>
                  <input
                    type="number"
                    value={gameParams.minesCount || 5}
                    onChange={(e) => updateGameParams('minesCount', parseInt(e.target.value))}
                    className="input w-full"
                    min="1"
                    max="24"
                  />
                </div>
              </div>
            )}

            {gameType === 'PLINKO' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Rows</label>
                <select
                  value={gameParams.rows || 12}
                  onChange={(e) => updateGameParams('rows', parseInt(e.target.value))}
                  className="input w-full"
                >
                  {[8, 9, 10, 11, 12, 13, 14, 15, 16].map(r => (
                    <option key={r} value={r}>{r} Rows</option>
                  ))}
                </select>
              </div>
            )}

            {gameType === 'WHEEL' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Segments</label>
                <select
                  value={gameParams.segments || 10}
                  onChange={(e) => updateGameParams('segments', parseInt(e.target.value))}
                  className="input w-full"
                >
                  {[10, 20, 30, 40, 50].map(s => (
                    <option key={s} value={s}>{s} Segments</option>
                  ))}
                </select>
              </div>
            )}

            {gameType === 'TOWER' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Floors</label>
                <select
                  value={gameParams.floors || 8}
                  onChange={(e) => updateGameParams('floors', parseInt(e.target.value))}
                  className="input w-full"
                >
                  {[8, 10, 12, 15].map(f => (
                    <option key={f} value={f}>{f} Floors</option>
                  ))}
                </select>
              </div>
            )}

            {gameType === 'STAIRS' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Steps</label>
                <select
                  value={gameParams.steps || 8}
                  onChange={(e) => updateGameParams('steps', parseInt(e.target.value))}
                  className="input w-full"
                >
                  {[8, 10, 12, 15].map(s => (
                    <option key={s} value={s}>{s} Steps</option>
                  ))}
                </select>
              </div>
            )}

            {gameType === 'BALLOON' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Pumps</label>
                <input
                  type="number"
                  value={gameParams.maxPumps || 100}
                  onChange={(e) => updateGameParams('maxPumps', parseInt(e.target.value))}
                  className="input w-full"
                  min="10"
                  max="200"
                />
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={verifyBet}
              className="btn-primary w-full py-3 text-lg"
            >
              Verify Bet
            </button>

            {/* Result */}
            {result && (
              <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-bold text-primary">Verification Result - {result.gameType}</h3>
                
                {/* Float Display */}
                <div>
                  <div className="text-sm text-gray-400">Random Float(s)</div>
                  <div className="font-mono text-sm">
                    {result.floats.slice(0, 5).map((f: number, i: number) => (
                      <div key={i}>{f.toFixed(10)}</div>
                    ))}
                    {result.floats.length > 5 && <div className="text-gray-500">... and {result.floats.length - 5} more</div>}
                  </div>
                </div>

                {/* HMAC */}
                <div>
                  <div className="text-sm text-gray-400">HMAC-SHA256 Output</div>
                  <div className="font-mono text-xs break-all text-gray-300">{result.hmac}</div>
                </div>

                {/* Game-Specific Results */}
                <div className="bg-gray-900 p-4 rounded space-y-3">
                  {/* DICE */}
                  {result.result.roll !== undefined && (
                    <div>
                      <div className="text-sm text-gray-400">Dice Roll</div>
                      <div className="font-mono text-3xl font-bold text-secondary">{result.result.roll}</div>
                    </div>
                  )}

                  {/* LIMBO / CRASH */}
                  {result.result.crashPoint !== undefined && (
                    <div>
                      <div className="text-sm text-gray-400">Crash Point</div>
                      <div className="font-mono text-3xl font-bold text-secondary">{result.result.crashPoint}x</div>
                    </div>
                  )}

                  {/* MINES */}
                  {result.result.minePositions && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Mine Positions (Grid {result.result.gridSize})</div>
                      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.sqrt(result.result.gridSize)}, minmax(0, 1fr))` }}>
                        {result.result.grid.map((isMine: boolean, idx: number) => (
                          <div
                            key={idx}
                            className={`aspect-square flex items-center justify-center text-xs font-bold rounded ${
                              isMine ? 'bg-red-600' : 'bg-green-600/30'
                            }`}
                          >
                            {isMine ? '💣' : idx}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Mine positions: [{result.result.minePositions.join(', ')}]
                      </div>
                    </div>
                  )}

                  {/* KENO */}
                  {result.result.drawnNumbers && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Drawn Numbers</div>
                      <div className="flex flex-wrap gap-2">
                        {result.result.drawnNumbers.map((num: number) => (
                          <div key={num} className="bg-primary text-white px-3 py-2 rounded font-bold">
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PLINKO */}
                  {result.result.path && (
                    <div>
                      <div className="text-sm text-gray-400">Plinko Path → Final Slot</div>
                      <div className="font-mono text-lg">
                        {result.result.path.map((d: number) => d === 0 ? 'L' : 'R').join('')} → <span className="text-secondary font-bold">Slot {result.result.finalSlot}</span>
                      </div>
                    </div>
                  )}

                  {/* ROULETTE */}
                  {result.result.pocket !== undefined && (
                    <div>
                      <div className="text-sm text-gray-400">Roulette Pocket</div>
                      <div className="font-mono text-3xl font-bold text-secondary">{result.result.pocket}</div>
                    </div>
                  )}

                  {/* WHEEL */}
                  {result.result.segment !== undefined && (
                    <div>
                      <div className="text-sm text-gray-400">Wheel Segment</div>
                      <div className="font-mono text-3xl font-bold text-secondary">
                        {result.result.segment} / {result.result.segments}
                      </div>
                    </div>
                  )}

                  {/* COINFLIP */}
                  {result.result.result && typeof result.result.result === 'string' && (
                    <div>
                      <div className="text-sm text-gray-400">Coin Flip Result</div>
                      <div className="font-mono text-3xl font-bold text-secondary capitalize">{result.result.result}</div>
                    </div>
                  )}

                  {/* FASTPARITY */}
                  {result.result.number !== undefined && result.result.color && (
                    <div>
                      <div className="text-sm text-gray-400">Fast Parity Result</div>
                      <div className="font-mono text-3xl font-bold text-secondary">
                        {result.result.number} <span className="text-lg">({result.result.color})</span>
                      </div>
                    </div>
                  )}

                  {/* BALLOON */}
                  {result.result.burstAt !== undefined && (
                    <div>
                      <div className="text-sm text-gray-400">Balloon Burst At</div>
                      <div className="font-mono text-3xl font-bold text-secondary">
                        Pump {result.result.burstAt} / {result.result.maxPumps}
                      </div>
                    </div>
                  )}

                  {/* TOWER */}
                  {result.result.dangerPositions && result.gameType === 'TOWER' && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Tower Danger Positions ({result.result.floors} floors)</div>
                      <div className="grid gap-1 grid-cols-3">
                        {result.result.grid.map((isDanger: boolean, idx: number) => (
                          <div
                            key={idx}
                            className={`aspect-square flex items-center justify-center text-xs font-bold rounded ${
                              isDanger ? 'bg-red-600' : 'bg-green-600/30'
                            }`}
                          >
                            {isDanger ? '⚠️' : '✓'}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Danger positions: [{result.result.dangerPositions.join(', ')}]
                      </div>
                    </div>
                  )}

                  {/* STAIRS */}
                  {result.result.dangerPositions && result.gameType === 'STAIRS' && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Stairs Danger Positions ({result.result.steps} steps)</div>
                      <div className="grid gap-1 grid-cols-2">
                        {result.result.grid.map((isDanger: boolean, idx: number) => (
                          <div
                            key={idx}
                            className={`aspect-square flex items-center justify-center text-xs font-bold rounded ${
                              isDanger ? 'bg-red-600' : 'bg-green-600/30'
                            }`}
                          >
                            {isDanger ? '⚠️' : '✓'}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Danger positions: [{result.result.dangerPositions.join(', ')}]
                      </div>
                    </div>
                  )}

                  {/* HILO */}
                  {result.result.currentCard !== undefined && result.result.nextCard !== undefined && (
                    <div>
                      <div className="text-sm text-gray-400">HiLo Cards</div>
                      <div className="font-mono text-2xl font-bold text-secondary">
                        Current: {result.result.currentCard} → Next: {result.result.nextCard}
                      </div>
                    </div>
                  )}

                  {/* BLACKJACK */}
                  {result.result.playerCards && result.result.dealerCards && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Blackjack Initial Deal</div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400">Player: </span>
                          <span className="font-mono text-lg font-bold text-secondary">
                            {result.result.playerCards.join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Dealer: </span>
                          <span className="font-mono text-lg font-bold text-secondary">
                            {result.result.dealerCards.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                <div className="bg-gray-900 p-4 rounded">
                  <div className="text-sm text-gray-400 mb-2">Calculation</div>
                  <div className="font-mono text-sm text-gray-300">{result.explanation}</div>
                </div>

                {/* Algorithm Info */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Stake's Provably Fair Algorithm:</strong></p>
                  <p>1. currentRound = floor(cursor / 32)</p>
                  <p>2. HMAC-SHA256(serverSeed, "clientSeed:nonce:currentRound")</p>
                  <p>3. Bytes → floats (4 bytes per float)</p>
                  <p>4. Floats mapped to game-specific outcomes</p>
                  <p>5. Fisher-Yates shuffle for games requiring unique outcomes</p>
                </div>
              </div>
            )}

            {/* How to Use */}
            <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
              <h3 className="font-bold mb-2">How to Use</h3>
              <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                <li>Rotate your seed pair to reveal the server seed</li>
                <li>Find a bet you want to verify in your history</li>
                <li>Enter the server seed, client seed, and nonce</li>
                <li>Select the game type and configure parameters</li>
                <li>Click "Verify Bet" to recalculate the outcome</li>
                <li>Compare with the actual bet result</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
