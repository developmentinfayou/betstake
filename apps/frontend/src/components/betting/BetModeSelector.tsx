type BetMode = 'manual' | 'auto' | 'strategy';

interface BetModeSelectorProps {
  mode: BetMode;
  onChange: (mode: BetMode) => void;
  showStrategy?: boolean;
}

export default function BetModeSelector({ mode, onChange, showStrategy = false }: BetModeSelectorProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onChange('manual')}
        className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'manual' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
          }`}
      >
        Manual
      </button>
      <button
        onClick={() => onChange('auto')}
        className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'auto' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
          }`}
      >
        Auto
      </button>
      {showStrategy && (
        <button
          onClick={() => onChange('strategy')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all relative ${mode === 'strategy' ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'
            }`}
        >
          Advanced
          <span className="absolute -top-1 -right-1 text-[9px] bg-emerald-500 text-black px-1 rounded font-bold">New</span>
        </button>
      )}
    </div>
  );
}
