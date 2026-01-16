'use client';

import BetAmountSlider from './BetAmountSlider';

interface ManualBetControlsProps {
  amount: number;
  balance: number;
  onAmountChange: (amount: number) => void;
  onBet: () => void;
  disabled?: boolean;
  loading?: boolean;
  multiplier?: number;
  buttonText?: string;
}

export default function ManualBetControls({
  amount,
  balance,
  onAmountChange,
  onBet,
  disabled = false,
  loading = false,
  multiplier,
  buttonText = 'Bet',
}: ManualBetControlsProps) {
  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Bet Amount</h3>
      
      <input
        type="number"
        value={amount}
        onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
        className="input w-full mb-3"
        min="0"
        step="0.01"
      />

      <div className="mb-4">
        <BetAmountSlider
          value={amount}
          min={0.01}
          max={balance || 100}
          onChange={onAmountChange}
          disabled={disabled || loading}
        />
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <button onClick={() => onAmountChange(amount / 2)} className="btn-secondary py-2">½×</button>
        <button onClick={() => onAmountChange(amount * 2)} className="btn-secondary py-2">2×</button>
        <button onClick={() => onAmountChange(balance)} className="btn-secondary py-2">Max</button>
        <button onClick={() => onAmountChange(10)} className="btn-secondary py-2">Reset</button>
      </div>

      {multiplier && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-400 mb-1">Win Amount</div>
          <div className="text-xl font-bold text-green-500">
            💰 ${((amount * multiplier) - amount).toFixed(2)}
          </div>
        </div>
      )}

      <button
        onClick={onBet}
        disabled={disabled || loading || amount <= 0 || amount > balance}
        className="btn-primary w-full py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? `${buttonText}ting...` : `${buttonText} $${amount.toFixed(2)}`}
      </button>
    </div>
  );
}
