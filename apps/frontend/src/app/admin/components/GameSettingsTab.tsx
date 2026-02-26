import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as adminApi from '@/lib/admin-api';

const GAME_TYPES = [
    'DICE', 'LIMBO', 'CRASH', 'MINES', 'PLINKO', 'ROULETTE', 'FASTPARITY',
    'KENO', 'TOWER', 'HILO', 'BLACKJACK', 'WHEEL', 'BALLOON', 'RUSH',
    'COINFLIP', 'STAIRS'
];

export default function GameSettingsTab() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newPreset, setNewPreset] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getGameSettings();
            setSettings(data);
        } catch (error) {
            toast.error('Failed to load game settings');
        }
        setLoading(false);
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const data = await adminApi.updateGameSettings(settings);
            setSettings(data);
            toast.success('Game settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
        }
        setSaving(false);
    };

    const addPreset = () => {
        const val = parseFloat(newPreset);
        if (isNaN(val) || val <= 0) { toast.error('Enter a valid amount'); return; }
        if (settings.betPresets.includes(val)) { toast.error('Already exists'); return; }
        setSettings({ ...settings, betPresets: [...settings.betPresets, val].sort((a: number, b: number) => a - b) });
        setNewPreset('');
    };

    const removePreset = (val: number) => {
        setSettings({ ...settings, betPresets: settings.betPresets.filter((p: number) => p !== val) });
    };

    if (loading || !settings) {
        return <div className="card text-center py-12"><div className="text-xl text-gray-400">Loading Game Settings...</div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold gradient-text">🎮 Game Settings</h2>
                <button onClick={saveSettings} disabled={saving} className="btn-primary px-6 py-2">
                    {saving ? '💾 Saving...' : '💾 Save All Settings'}
                </button>
            </div>

            {/* Bet Amount Presets */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">💰 Bet Amount Presets (USD)</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {settings.betPresets?.map((preset: number) => (
                        <div key={preset} className="flex items-center gap-1 bg-gray-800 rounded-lg px-3 py-2">
                            <span className="font-mono font-bold">${preset}</span>
                            <button onClick={() => removePreset(preset)} className="text-red-400 hover:text-red-300 ml-1 text-sm">✕</button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input type="number" step="0.01" min="0" value={newPreset} onChange={(e) => setNewPreset(e.target.value)}
                        placeholder="Add preset amount (USD)" className="bg-gray-800 rounded px-3 py-2 flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && addPreset()} />
                    <button onClick={addPreset} className="btn-primary px-4">+ Add</button>
                </div>
            </div>

            {/* Bet Controls */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-blue-400">🎛️ Bet Controls</h3>
                <div className="grid grid-cols-2 gap-6">
                    <label className="flex items-center justify-between bg-gray-800 rounded-lg p-4 cursor-pointer">
                        <div>
                            <div className="font-bold">½x Button</div>
                            <div className="text-sm text-gray-400">Allow users to halve their bet</div>
                        </div>
                        <input type="checkbox" checked={settings.betControls?.halfX ?? true}
                            onChange={(e) => setSettings({ ...settings, betControls: { ...settings.betControls, halfX: e.target.checked } })}
                            className="w-5 h-5 accent-green-500" />
                    </label>
                    <label className="flex items-center justify-between bg-gray-800 rounded-lg p-4 cursor-pointer">
                        <div>
                            <div className="font-bold">2x Button</div>
                            <div className="text-sm text-gray-400">Allow users to double their bet</div>
                        </div>
                        <input type="checkbox" checked={settings.betControls?.doubleX ?? true}
                            onChange={(e) => setSettings({ ...settings, betControls: { ...settings.betControls, doubleX: e.target.checked } })}
                            className="w-5 h-5 accent-green-500" />
                    </label>
                </div>
            </div>

            {/* Display Settings */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-green-400">📊 Display Settings</h3>
                <div className="grid grid-cols-3 gap-6">
                    <label className="flex items-center justify-between bg-gray-800 rounded-lg p-4 cursor-pointer">
                        <div>
                            <div className="font-bold">Show Profit on Win</div>
                            <div className="text-sm text-gray-400">Display profit amount</div>
                        </div>
                        <input type="checkbox" checked={settings.showProfitOnWin ?? true}
                            onChange={(e) => setSettings({ ...settings, showProfitOnWin: e.target.checked })}
                            className="w-5 h-5 accent-green-500" />
                    </label>
                    <label className="flex items-center justify-between bg-gray-800 rounded-lg p-4 cursor-pointer">
                        <div>
                            <div className="font-bold">Leaderboard</div>
                            <div className="text-sm text-gray-400">Show/hide leaderboard</div>
                        </div>
                        <input type="checkbox" checked={settings.leaderboardVisible ?? true}
                            onChange={(e) => setSettings({ ...settings, leaderboardVisible: e.target.checked })}
                            className="w-5 h-5 accent-green-500" />
                    </label>
                    <label className="flex items-center justify-between bg-gray-800 rounded-lg p-4 cursor-pointer">
                        <div>
                            <div className="font-bold">Animations Default</div>
                            <div className="text-sm text-gray-400">Default state for animations</div>
                        </div>
                        <input type="checkbox" checked={settings.animationsDefault ?? true}
                            onChange={(e) => setSettings({ ...settings, animationsDefault: e.target.checked })}
                            className="w-5 h-5 accent-green-500" />
                    </label>
                </div>
            </div>

            {/* Live Stats */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-purple-400">📈 Live Stats</h3>
                <div className="grid grid-cols-2 gap-6">
                    <label className="flex items-center justify-between bg-gray-800 rounded-lg p-4 cursor-pointer">
                        <div>
                            <div className="font-bold">Enable Live Stats</div>
                            <div className="text-sm text-gray-400">Show live stats on game pages</div>
                        </div>
                        <input type="checkbox" checked={settings.liveStats?.enabled ?? true}
                            onChange={(e) => setSettings({ ...settings, liveStats: { ...settings.liveStats, enabled: e.target.checked } })}
                            className="w-5 h-5 accent-green-500" />
                    </label>
                    {settings.liveStats?.enabled && (
                        <label className="flex items-center justify-between bg-gray-800 rounded-lg p-4 cursor-pointer">
                            <div>
                                <div className="font-bold">Default State</div>
                                <div className="text-sm text-gray-400">Stats panel open by default</div>
                            </div>
                            <input type="checkbox" checked={settings.liveStats?.defaultOn ?? true}
                                onChange={(e) => setSettings({ ...settings, liveStats: { ...settings.liveStats, defaultOn: e.target.checked } })}
                                className="w-5 h-5 accent-green-500" />
                        </label>
                    )}
                </div>
            </div>

            {/* Sounds */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-orange-400">🔊 Sounds</h3>
                <div className="grid grid-cols-2 gap-6">
                    <label className="flex items-center justify-between bg-gray-800 rounded-lg p-4 cursor-pointer">
                        <div>
                            <div className="font-bold">Sounds Default</div>
                            <div className="text-sm text-gray-400">Enable sounds by default</div>
                        </div>
                        <input type="checkbox" checked={settings.sounds?.defaultOn ?? true}
                            onChange={(e) => setSettings({ ...settings, sounds: { ...settings.sounds, defaultOn: e.target.checked } })}
                            className="w-5 h-5 accent-green-500" />
                    </label>
                    {settings.sounds?.defaultOn && (
                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="font-bold mb-2">Default Volume: {settings.sounds?.defaultVolume ?? 50}%</div>
                            <input type="range" min="0" max="100" value={settings.sounds?.defaultVolume ?? 50}
                                onChange={(e) => setSettings({ ...settings, sounds: { ...settings.sounds, defaultVolume: parseInt(e.target.value) } })}
                                className="w-full accent-orange-500" />
                        </div>
                    )}
                </div>
            </div>

            {/* Hotkeys */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-cyan-400">⌨️ Hotkeys</h3>
                <div className="grid grid-cols-2 gap-6">
                    <label className="flex items-center justify-between bg-gray-800 rounded-lg p-4 cursor-pointer">
                        <div>
                            <div className="font-bold">Enable Hotkeys</div>
                            <div className="text-sm text-gray-400">Keyboard shortcuts for games</div>
                        </div>
                        <input type="checkbox" checked={settings.hotkeys?.enabled ?? false}
                            onChange={(e) => setSettings({ ...settings, hotkeys: { ...settings.hotkeys, enabled: e.target.checked } })}
                            className="w-5 h-5 accent-green-500" />
                    </label>
                    {settings.hotkeys?.enabled && (
                        <label className="flex items-center justify-between bg-gray-800 rounded-lg p-4 cursor-pointer">
                            <div>
                                <div className="font-bold">User Modification</div>
                                <div className="text-sm text-gray-400">Allow users to modify hotkeys</div>
                            </div>
                            <input type="checkbox" checked={settings.hotkeys?.allowUserModify ?? true}
                                onChange={(e) => setSettings({ ...settings, hotkeys: { ...settings.hotkeys, allowUserModify: e.target.checked } })}
                                className="w-5 h-5 accent-green-500" />
                        </label>
                    )}
                </div>
            </div>

            {/* Max Bet & Instant Bet */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-red-400">⚡ Bet Behavior</h3>
                <div className="grid grid-cols-2 gap-6">
                    {/* Max Bet */}
                    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                        <div className="font-bold text-lg">Max Bet</div>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-gray-400">Default On</span>
                            <input type="checkbox" checked={settings.maxBet?.defaultOn ?? true}
                                onChange={(e) => setSettings({ ...settings, maxBet: { ...settings.maxBet, defaultOn: e.target.checked } })}
                                className="w-5 h-5 accent-green-500" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-gray-400">Allow User Manual Toggle</span>
                            <input type="checkbox" checked={settings.maxBet?.allowUserManualToggle ?? true}
                                onChange={(e) => setSettings({ ...settings, maxBet: { ...settings.maxBet, allowUserManualToggle: e.target.checked } })}
                                className="w-5 h-5 accent-green-500" />
                        </label>
                    </div>

                    {/* Instant Bet */}
                    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                        <div className="font-bold text-lg">Instant Bet</div>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-gray-400">Default On</span>
                            <input type="checkbox" checked={settings.instantBet?.defaultOn ?? false}
                                onChange={(e) => setSettings({ ...settings, instantBet: { ...settings.instantBet, defaultOn: e.target.checked } })}
                                className="w-5 h-5 accent-green-500" />
                        </label>
                        {settings.instantBet?.defaultOn && (
                            <>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-gray-400">Animations</span>
                                    <input type="checkbox" checked={settings.instantBet?.animations ?? true}
                                        onChange={(e) => setSettings({ ...settings, instantBet: { ...settings.instantBet, animations: e.target.checked } })}
                                        className="w-5 h-5 accent-green-500" />
                                </label>
                                <div>
                                    <label className="text-sm text-gray-400">Speed Multiplier</label>
                                    <input type="number" min="1" max="100" value={settings.instantBet?.speedMultiplier ?? 2}
                                        onChange={(e) => setSettings({ ...settings, instantBet: { ...settings.instantBet, speedMultiplier: parseInt(e.target.value) || 2 } })}
                                        className="w-full bg-gray-700 rounded px-3 py-2 mt-1" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Auto Bet per Game */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-emerald-400">🔄 Auto Bet (Per Game)</h3>
                <div className="grid grid-cols-4 gap-3">
                    {GAME_TYPES.map(game => (
                        <label key={game} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2 cursor-pointer text-sm">
                            <span>{game}</span>
                            <input type="checkbox" checked={settings.autoBetEnabled?.[game] ?? true}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    autoBetEnabled: { ...settings.autoBetEnabled, [game]: e.target.checked }
                                })}
                                className="w-4 h-4 accent-green-500" />
                        </label>
                    ))}
                </div>
            </div>

            {/* Advanced Auto Bet per Game */}
            <div className="card">
                <h3 className="text-xl font-bold mb-4 text-emerald-400">🔧 Advanced Auto Bet Options (Per Game)</h3>
                <div className="grid grid-cols-4 gap-3">
                    {GAME_TYPES.map(game => (
                        <label key={game} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2 cursor-pointer text-sm">
                            <span>{game}</span>
                            <input type="checkbox" checked={settings.advancedAutoBetEnabled?.[game] ?? true}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    advancedAutoBetEnabled: { ...settings.advancedAutoBetEnabled, [game]: e.target.checked }
                                })}
                                className="w-4 h-4 accent-green-500" />
                        </label>
                    ))}
                </div>
            </div>

            {/* Bottom Save */}
            <div className="flex justify-end">
                <button onClick={saveSettings} disabled={saving} className="btn-primary px-8 py-3 text-lg">
                    {saving ? '💾 Saving...' : '💾 Save All Game Settings'}
                </button>
            </div>
        </div>
    );
}
