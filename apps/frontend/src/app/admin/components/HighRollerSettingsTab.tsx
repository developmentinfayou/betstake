import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as adminApi from '@/lib/admin-api';

const GAME_TYPES = [
    'DICE', 'LIMBO', 'CRASH', 'MINES', 'PLINKO', 'ROULETTE', 'FASTPARITY',
    'KENO', 'TOWER', 'HILO', 'BLACKJACK', 'WHEEL', 'BALLOON', 'RUSH',
    'COINFLIP', 'STAIRS'
];

export default function HighRollerSettingsTab() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getWinCategories();
            setSettings(data);
        } catch (error) {
            toast.error('Failed to load win category settings');
        }
        setLoading(false);
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const data = await adminApi.updateWinCategories(settings);
            setSettings(data);
            toast.success('Win category settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
        }
        setSaving(false);
    };

    if (loading || !settings) {
        return <div className="card text-center py-12"><div className="text-xl text-gray-400">Loading Win Settings...</div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold gradient-text">🏆 High Rollers & Win Categories</h2>
                <button onClick={saveSettings} disabled={saving} className="btn-primary px-6 py-2">
                    {saving ? '💾 Saving...' : '💾 Save Settings'}
                </button>
            </div>

            {/* High Roller */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">🎩 High Roller Condition</h3>
                <p className="text-sm text-gray-400 mb-4">Define what qualifies a bet as a "High Roller" bet</p>

                <div className="mb-4">
                    <label className="text-sm text-gray-400 font-bold">Condition Mode</label>
                    <div className="flex gap-3 mt-2">
                        <button onClick={() => setSettings({ ...settings, highRoller: { ...settings.highRoller, mode: 'AMOUNT' } })}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${settings.highRoller?.mode === 'AMOUNT'
                                ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                            💵 By Amount (USD)
                        </button>
                        <button onClick={() => setSettings({ ...settings, highRoller: { ...settings.highRoller, mode: 'MULTIPLIER' } })}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${settings.highRoller?.mode === 'MULTIPLIER'
                                ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                            📈 By Multiplier
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className={settings.highRoller?.mode === 'AMOUNT' ? '' : 'opacity-40'}>
                        <label className="text-sm text-gray-400">Minimum Bet Amount (USD)</label>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xl">$</span>
                            <input type="number" step="1" min="0" value={settings.highRoller?.amountUSD ?? 100}
                                onChange={(e) => setSettings({ ...settings, highRoller: { ...settings.highRoller, amountUSD: parseFloat(e.target.value) || 0 } })}
                                className="w-full bg-gray-800 rounded px-3 py-2" disabled={settings.highRoller?.mode !== 'AMOUNT'} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Bets ≥ this amount are "High Roller" bets</p>
                    </div>
                    <div className={settings.highRoller?.mode === 'MULTIPLIER' ? '' : 'opacity-40'}>
                        <label className="text-sm text-gray-400">Minimum Multiplier</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="number" step="0.1" min="1" value={settings.highRoller?.multiplier ?? 10}
                                onChange={(e) => setSettings({ ...settings, highRoller: { ...settings.highRoller, multiplier: parseFloat(e.target.value) || 1 } })}
                                className="w-full bg-gray-800 rounded px-3 py-2" disabled={settings.highRoller?.mode !== 'MULTIPLIER'} />
                            <span className="text-xl">x</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Bets with multiplier ≥ this are "High Roller"</p>
                    </div>
                </div>
            </div>

            {/* Big Win */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-green-400">🎉 Big Win</h3>
                <p className="text-sm text-gray-400 mb-4">Minimum bet amount for a win to be considered a "Big Win"</p>
                <div className="max-w-md">
                    <label className="text-sm text-gray-400">Minimum Bet Amount (USD)</label>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl">$</span>
                        <input type="number" step="0.01" min="0" value={settings.bigWin?.minBetAmountUSD ?? 10}
                            onChange={(e) => setSettings({ ...settings, bigWin: { minBetAmountUSD: parseFloat(e.target.value) || 0 } })}
                            className="w-full bg-gray-800 rounded px-3 py-2" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Only bets ≥ this amount can qualify for "Big Win" display</p>
                </div>
            </div>

            {/* Lucky Win */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-purple-400">🍀 Lucky Win</h3>
                <p className="text-sm text-gray-400 mb-4">Minimum multiplier for a win to be considered a "Lucky Win"</p>

                <div className="mb-4">
                    <label className="text-sm text-gray-400 font-bold">Mode</label>
                    <div className="flex gap-3 mt-2">
                        <button onClick={() => setSettings({ ...settings, luckyWin: { ...settings.luckyWin, mode: 'GLOBAL' } })}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${settings.luckyWin?.mode === 'GLOBAL'
                                ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                            🌐 Global (All Games)
                        </button>
                        <button onClick={() => setSettings({ ...settings, luckyWin: { ...settings.luckyWin, mode: 'PER_GAME' } })}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${settings.luckyWin?.mode === 'PER_GAME'
                                ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                            🎮 Per Game
                        </button>
                    </div>
                </div>

                {settings.luckyWin?.mode === 'GLOBAL' && (
                    <div className="max-w-md">
                        <label className="text-sm text-gray-400">Global Minimum Multiplier</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="number" step="0.1" min="1" value={settings.luckyWin?.globalMinMultiplier ?? 10}
                                onChange={(e) => setSettings({ ...settings, luckyWin: { ...settings.luckyWin, globalMinMultiplier: parseFloat(e.target.value) || 1 } })}
                                className="w-full bg-gray-800 rounded px-3 py-2" />
                            <span className="text-xl">x</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Wins with multiplier ≥ this are "Lucky Wins"</p>
                    </div>
                )}

                {settings.luckyWin?.mode === 'PER_GAME' && (
                    <div className="space-y-2">
                        <div className="mb-3">
                            <label className="text-sm text-gray-400">Global Fallback Multiplier</label>
                            <div className="flex items-center gap-2 mt-1 max-w-xs">
                                <input type="number" step="0.1" min="1" value={settings.luckyWin?.globalMinMultiplier ?? 10}
                                    onChange={(e) => setSettings({ ...settings, luckyWin: { ...settings.luckyWin, globalMinMultiplier: parseFloat(e.target.value) || 1 } })}
                                    className="w-full bg-gray-800 rounded px-3 py-2" />
                                <span>x</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {GAME_TYPES.map(game => (
                                <div key={game} className="bg-gray-800 rounded-lg p-3">
                                    <label className="text-xs text-gray-400">{game}</label>
                                    <div className="flex items-center gap-1 mt-1">
                                        <input type="number" step="0.1" min="1"
                                            value={settings.luckyWin?.perGameMinMultiplier?.[game] ?? settings.luckyWin?.globalMinMultiplier ?? 10}
                                            onChange={(e) => {
                                                const perGame = { ...(settings.luckyWin?.perGameMinMultiplier || {}) };
                                                perGame[game] = parseFloat(e.target.value) || 1;
                                                setSettings({ ...settings, luckyWin: { ...settings.luckyWin, perGameMinMultiplier: perGame } });
                                            }}
                                            className="w-full bg-gray-700 rounded px-2 py-1 text-sm" />
                                        <span className="text-xs">x</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Save */}
            <div className="flex justify-end">
                <button onClick={saveSettings} disabled={saving} className="btn-primary px-8 py-3 text-lg">
                    {saving ? '💾 Saving...' : '💾 Save Win Category Settings'}
                </button>
            </div>
        </div>
    );
}
