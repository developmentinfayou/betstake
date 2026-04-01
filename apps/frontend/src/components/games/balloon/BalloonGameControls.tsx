import { PUMP_STEPS, PumpDifficulty } from '@casino/game-engine/games/balloon/constants';

export interface BalloonGameControlsProps {
  difficulty: PumpDifficulty;
  onChangeDifficulty: (difficulty: PumpDifficulty) => void;
  disabled?: boolean;
  gameActive: boolean;
  currentPumpIndex: number; // 0 = start, 1 = first pump, etc.
  onPump?: () => void;
  burstAtPump?: number; // Highlights the burst step
}

export default function BalloonGameControls({
  difficulty,
  onChangeDifficulty,
  disabled = false,
  gameActive,
  currentPumpIndex,
  onPump,
  burstAtPump,
}: BalloonGameControlsProps) {
  const steps = PUMP_STEPS[difficulty];

  // Show a sliding window of steps around the current position
  const startIdx = Math.max(0, currentPumpIndex - 2);
  const visibleSteps = steps.slice(startIdx, startIdx + 8);

  return (
    <div className="space-y-6">
      {!gameActive && (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <label className="block text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
            Select Difficulty
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['easy', 'medium', 'hard', 'expert'] as PumpDifficulty[]).map(d => (
              <button
                key={d}
                onClick={() => onChangeDifficulty(d)}
                disabled={disabled || gameActive}
                className={`py-3 rounded-lg font-bold capitalize transition-all border ${
                  difficulty === d
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                } disabled:opacity-50`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pump Step Visualization */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-gray-900 pointer-events-none z-10" />
        
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 scrollbar-hide relative z-0">
          {visibleSteps.map((multiplier, idx) => {
            const actualIndex = startIdx + idx;
            const isPassed = actualIndex <= currentPumpIndex && actualIndex > 0;
            const isCurrent = actualIndex === currentPumpIndex && gameActive;
            const isNext = actualIndex === currentPumpIndex + 1 && gameActive;
            const isBurst = burstAtPump === actualIndex;

            let badgeStyle = 'bg-gray-800 text-gray-500 border-gray-700';
            if (isBurst) {
              badgeStyle = 'bg-red-900/40 text-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
            } else if (isCurrent && !burstAtPump) {
              badgeStyle = 'bg-green-900/40 text-green-400 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] transform scale-110 z-10 font-bold';
            } else if (isNext && !burstAtPump) {
              badgeStyle = 'bg-primary/20 text-primary border-primary animate-pulse shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.2)]';
            } else if (isPassed && !burstAtPump) {
              badgeStyle = 'bg-green-900/20 text-green-600 border-green-900/50';
            }

            return (
              <div
                key={actualIndex}
                className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[80px] h-[80px] rounded-full border-2 transition-all duration-300 ${badgeStyle}`}
              >
                <div className="text-xl">{multiplier.toFixed(2)}x</div>
                <div className="text-[10px] uppercase tracking-wider opacity-60">
                  {actualIndex === 0 ? 'Start' : `Pump ${actualIndex}`}
                </div>
              </div>
            );
          })}
        </div>

        {gameActive && !burstAtPump && (
          <div className="mt-8">
            <button
              onClick={onPump}
              disabled={disabled}
              className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] disabled:opacity-50"
            >
              🎈 Pump to {steps[currentPumpIndex + 1]?.toFixed(2)}x
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
