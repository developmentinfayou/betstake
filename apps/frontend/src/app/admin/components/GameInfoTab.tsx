import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as adminApi from '@/lib/admin-api';

const GAME_TYPES = [
    'DICE', 'LIMBO', 'CRASH', 'MINES', 'PLINKO', 'ROULETTE', 'FASTPARITY',
    'KENO', 'TOWER', 'HILO', 'BLACKJACK', 'WHEEL', 'BALLOON', 'RUSH',
    'COINFLIP', 'STAIRS'
];

const RANKING_TABS = ['my_bets', 'big_wins', 'lucky_wins', 'high_rollers', 'leaderboards'];
const LEADERBOARD_DEFAULTS = ['wins', 'wager', 'lose'];

export default function GameInfoTab() {
    const [selectedGame, setSelectedGame] = useState<string>('');
    const [gameInfo, setGameInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [allGameInfo, setAllGameInfo] = useState<any[]>([]);

    useEffect(() => {
        loadAllGameInfo();
    }, []);

    const loadAllGameInfo = async () => {
        try {
            const data = await adminApi.getGameInfoList();
            setAllGameInfo(data);
        } catch (error) {
            console.error('Failed to load game info list:', error);
        }
    };

    const loadGameInfo = async (gameType: string) => {
        setLoading(true);
        try {
            const data = await adminApi.getGameInfo(gameType);
            setGameInfo(data);
            setSelectedGame(gameType);
        } catch (error) {
            toast.error('Failed to load game info');
        }
        setLoading(false);
    };

    const saveGameInfo = async () => {
        if (!selectedGame) return;
        setSaving(true);
        try {
            const data = await adminApi.updateGameInfo(selectedGame, gameInfo);
            setGameInfo(data);
            loadAllGameInfo();
            toast.success(`${selectedGame} info saved`);
        } catch (error) {
            toast.error('Failed to save game info');
        }
        setSaving(false);
    };

    const initializeAll = async () => {
        try {
            const result = await adminApi.initializeGameInfo();
            toast.success(`Initialized: ${result.created} games`);
            loadAllGameInfo();
        } catch (error) {
            toast.error('Failed to initialize');
        }
    };

    const addStep = () => {
        const steps = [...(gameInfo.howToPlay || [])];
        steps.push({ stepNumber: steps.length + 1, description: '', imageUrl: '' });
        setGameInfo({ ...gameInfo, howToPlay: steps });
    };

    const updateStep = (index: number, field: string, value: string) => {
        const steps = [...(gameInfo.howToPlay || [])];
        steps[index] = { ...steps[index], [field]: value };
        setGameInfo({ ...gameInfo, howToPlay: steps });
    };

    const removeStep = (index: number) => {
        const steps = [...(gameInfo.howToPlay || [])].filter((_: any, i: number) => i !== index)
            .map((s: any, i: number) => ({ ...s, stepNumber: i + 1 }));
        setGameInfo({ ...gameInfo, howToPlay: steps });
    };

    const addVideo = () => {
        const videos = [...(gameInfo.videos || [])];
        videos.push({ description: '', url: '', sourceType: 'youtube' });
        setGameInfo({ ...gameInfo, videos });
    };

    const updateVideo = (index: number, field: string, value: string) => {
        const videos = [...(gameInfo.videos || [])];
        videos[index] = { ...videos[index], [field]: value };
        setGameInfo({ ...gameInfo, videos });
    };

    const removeVideo = (index: number) => {
        const videos = [...(gameInfo.videos || [])].filter((_: any, i: number) => i !== index);
        setGameInfo({ ...gameInfo, videos });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold gradient-text">📋 Game Information</h2>
                <button onClick={initializeAll} className="btn-secondary px-4 py-2 text-sm">
                    🔄 Initialize All Games
                </button>
            </div>

            {/* Game Selector Grid */}
            <div className="card">
                <h3 className="text-lg font-bold mb-3 text-gray-300">Select Game to Edit</h3>
                <div className="grid grid-cols-6 gap-2">
                    {GAME_TYPES.map(game => {
                        const hasInfo = allGameInfo.some((gi: any) => gi.gameType === game);
                        return (
                            <button key={game} onClick={() => loadGameInfo(game)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedGame === game
                                    ? 'bg-gradient-to-r from-primary to-secondary text-black font-bold'
                                    : hasInfo
                                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}>
                                {game}
                                {hasInfo && <span className="ml-1 text-green-400 text-xs">✓</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Game Info Editor */}
            {loading && <div className="card text-center py-8"><div className="text-gray-400">Loading...</div></div>}

            {gameInfo && !loading && (
                <div className="space-y-6">
                    {/* Description & Rules */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4 text-yellow-400">📝 Description & Rules — {selectedGame}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 font-bold">Description (HTML)</label>
                                <textarea value={gameInfo.description || ''} rows={4}
                                    onChange={(e) => setGameInfo({ ...gameInfo, description: e.target.value })}
                                    className="w-full bg-gray-800 rounded px-3 py-2 mt-1 font-mono text-sm" placeholder="Enter game description..." />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 font-bold">Rules (HTML)</label>
                                <textarea value={gameInfo.rules || ''} rows={4}
                                    onChange={(e) => setGameInfo({ ...gameInfo, rules: e.target.value })}
                                    className="w-full bg-gray-800 rounded px-3 py-2 mt-1 font-mono text-sm" placeholder="Enter game rules..." />
                            </div>
                        </div>
                    </div>

                    {/* Limits */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4 text-blue-400">📊 Game-Specific Limits (USD)</h3>
                        <p className="text-sm text-gray-400 mb-3">Leave empty to use global limits</p>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm text-gray-400">Min Bet</label>
                                <input type="number" step="0.01" value={gameInfo.limits?.minBet ?? ''}
                                    onChange={(e) => setGameInfo({ ...gameInfo, limits: { ...gameInfo.limits, minBet: e.target.value ? parseFloat(e.target.value) : undefined } })}
                                    className="w-full bg-gray-800 rounded px-3 py-2 mt-1" placeholder="Global" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Max Bet</label>
                                <input type="number" step="0.01" value={gameInfo.limits?.maxBet ?? ''}
                                    onChange={(e) => setGameInfo({ ...gameInfo, limits: { ...gameInfo.limits, maxBet: e.target.value ? parseFloat(e.target.value) : undefined } })}
                                    className="w-full bg-gray-800 rounded px-3 py-2 mt-1" placeholder="Global" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Max Win</label>
                                <input type="number" step="0.01" value={gameInfo.limits?.maxWin ?? ''}
                                    onChange={(e) => setGameInfo({ ...gameInfo, limits: { ...gameInfo.limits, maxWin: e.target.value ? parseFloat(e.target.value) : undefined } })}
                                    className="w-full bg-gray-800 rounded px-3 py-2 mt-1" placeholder="Global" />
                            </div>
                        </div>
                    </div>

                    {/* How to Play */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-green-400">📖 How to Play</h3>
                            <button onClick={addStep} className="btn-primary px-3 py-1 text-sm">+ Add Step</button>
                        </div>
                        <div className="space-y-3">
                            {(gameInfo.howToPlay || []).map((step: any, i: number) => (
                                <div key={i} className="bg-gray-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-primary">Step {step.stepNumber}</span>
                                        <button onClick={() => removeStep(i)} className="text-red-400 hover:text-red-300 text-sm">🗑️ Remove</button>
                                    </div>
                                    <textarea value={step.description || ''} rows={2}
                                        onChange={(e) => updateStep(i, 'description', e.target.value)}
                                        className="w-full bg-gray-700 rounded px-3 py-2 mb-2 text-sm" placeholder="Step description (HTML)..." />
                                    <input type="text" value={step.imageUrl || ''}
                                        onChange={(e) => updateStep(i, 'imageUrl', e.target.value)}
                                        className="w-full bg-gray-700 rounded px-3 py-2 text-sm" placeholder="Image URL (optional)" />
                                </div>
                            ))}
                            {(gameInfo.howToPlay || []).length === 0 && (
                                <div className="text-gray-500 text-center py-4">No steps added yet</div>
                            )}
                        </div>
                    </div>

                    {/* Videos */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-purple-400">🎬 Videos</h3>
                            <button onClick={addVideo} className="btn-primary px-3 py-1 text-sm">+ Add Video</button>
                        </div>
                        <div className="space-y-3">
                            {(gameInfo.videos || []).map((video: any, i: number) => (
                                <div key={i} className="bg-gray-800 rounded-lg p-4">
                                    <div className="flex justify-end mb-2">
                                        <button onClick={() => removeVideo(i)} className="text-red-400 hover:text-red-300 text-sm">🗑️ Remove</button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <input type="text" value={video.description || ''}
                                            onChange={(e) => updateVideo(i, 'description', e.target.value)}
                                            className="bg-gray-700 rounded px-3 py-2 text-sm" placeholder="Video description" />
                                        <input type="text" value={video.url || ''}
                                            onChange={(e) => updateVideo(i, 'url', e.target.value)}
                                            className="bg-gray-700 rounded px-3 py-2 text-sm" placeholder="Video URL / YouTube Link" />
                                        <select value={video.sourceType || 'youtube'}
                                            onChange={(e) => updateVideo(i, 'sourceType', e.target.value)}
                                            className="bg-gray-700 rounded px-3 py-2 text-sm">
                                            <option value="youtube">YouTube</option>
                                            <option value="upload">Uploaded</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                            {(gameInfo.videos || []).length === 0 && (
                                <div className="text-gray-500 text-center py-4">No videos added yet</div>
                            )}
                        </div>
                    </div>

                    {/* Game Icon & Rankings */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4 text-orange-400">🎨 Icon & Rankings</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-400 font-bold">Game Icon URL</label>
                                <input type="text" value={gameInfo.gameIcon || ''}
                                    onChange={(e) => setGameInfo({ ...gameInfo, gameIcon: e.target.value })}
                                    className="w-full bg-gray-800 rounded px-3 py-2 mt-1" placeholder="Icon image URL" />
                                {gameInfo.gameIcon && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <img src={gameInfo.gameIcon} alt="icon" className="w-10 h-10 rounded" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                        <span className="text-xs text-gray-400">Preview</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-400 font-bold">Default Rankings Tab</label>
                                    <select value={gameInfo.rankings?.defaultTab || 'my_bets'}
                                        onChange={(e) => setGameInfo({ ...gameInfo, rankings: { ...gameInfo.rankings, defaultTab: e.target.value } })}
                                        className="w-full bg-gray-800 rounded px-3 py-2 mt-1">
                                        {RANKING_TABS.map(tab => (
                                            <option key={tab} value={tab}>{tab.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 font-bold">Leaderboard Default Sort</label>
                                    <select value={gameInfo.rankings?.leaderboardDefault || 'wager'}
                                        onChange={(e) => setGameInfo({ ...gameInfo, rankings: { ...gameInfo.rankings, leaderboardDefault: e.target.value } })}
                                        className="w-full bg-gray-800 rounded px-3 py-2 mt-1">
                                        {LEADERBOARD_DEFAULTS.map(opt => (
                                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Share Settings */}
                    <div className="card">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <h3 className="text-xl font-bold text-cyan-400">🔗 Share Game</h3>
                                <p className="text-sm text-gray-400">Allow sharing this game on social media</p>
                            </div>
                            <input type="checkbox" checked={gameInfo.shareEnabled ?? true}
                                onChange={(e) => setGameInfo({ ...gameInfo, shareEnabled: e.target.checked })}
                                className="w-6 h-6 accent-green-500" />
                        </label>
                    </div>

                    {/* Save */}
                    <div className="flex justify-end">
                        <button onClick={saveGameInfo} disabled={saving} className="btn-primary px-8 py-3 text-lg">
                            {saving ? '💾 Saving...' : `💾 Save ${selectedGame} Info`}
                        </button>
                    </div>
                </div>
            )}

            {!selectedGame && !loading && (
                <div className="card text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <div className="text-xl text-gray-400">Select a game above to edit its information</div>
                </div>
            )}
        </div>
    );
}
