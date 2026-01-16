'use client';

import { useState, ReactNode } from 'react';
import { useUniversalGameLogic } from '@/hooks/useUniversalGameLogic';
import { GameType } from '@casino/shared';
import GameHeader from '@/components/games/shared/GameHeader';
import GameResult from '@/components/games/shared/GameResult';
import BetModeSelector from '@/components/betting/BetModeSelector';
import ManualBetControls from '@/components/betting/ManualBetControls';
import AutoBetControls, { AutoBetConfig } from '@/components/betting/AutoBetControls';
import AutoBetStatus from '@/components/games/AutoBetStatus';
import LiveStats from '@/components/games/LiveStats';
import FairnessModal from '@/components/games/FairnessModal';

type BetMode = 'manual' | 'auto' | 'strategy';

interface GamePageTemplateProps<T = any> {
  gameType: GameType;
  gameTitle: string;
  initialGameParams: T;
  GameControlsComponent: React.ComponentType<{
    onChange: (params: T) => void;
    disabled?: boolean;
    [key: string]: any;
  }>;
  betModes?: BetMode[];
  currency?: string;
  customResultDisplay?: (result: any) => ReactNode;
  gameControlsProps?: Record<string, any>;
  children?: ReactNode;
}

export default function GamePageTemplate<T>({
  gameType,
  gameTitle,
  initialGameParams,
  GameControlsComponent,
  betModes = ['manual', 'auto', 'strategy'],
  currency = 'USD',
  customResultDisplay,
  gameControlsProps = {},
  children
}: GamePageTemplateProps<T>) {
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [gameParams, setGameParams] = useState<T>(initialGameParams);

  const {
    amount,
    loading,
    result,
    balance,
    stats,
    autoBetActive,
    fairnessModalOpen,
    setAmount,
    placeBet,
    startAutoBet,
    stopAutoBet,
    resetStats,
    setFairnessModalOpen,
    canBet
  } = useUniversalGameLogic({ gameType, currency });

  const handlePlaceBet = async () => {
    await placeBet(gameParams);
  };

  const handleStartAutoBet = async (config: AutoBetConfig) => {
    await startAutoBet(gameParams, config);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <GameHeader
        gameTitle={gameTitle}
        balance={balance}
        currency={currency}
        onFairnessClick={() => setFairnessModalOpen(true)}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">{gameTitle}</h2>

              {/* Result Display */}
              <GameResult
                result={result}
                amount={amount}
                gameType={gameType}
                customDisplay={customResultDisplay}
              />

              {/* Game-Specific Controls */}
              <GameControlsComponent
                onChange={setGameParams}
                disabled={loading || autoBetActive}
                {...gameControlsProps}
              />

              {/* Custom Children (for special game logic) */}
              {children}
            </div>
          </div>

          {/* Bet Controls Sidebar */}
          <div className="space-y-6">
            {/* Bet Mode Selector */}
            <div className="card">
              <BetModeSelector
                mode={betMode}
                onChange={setBetMode}
                showStrategy={betModes.includes('strategy')}
              />

              {/* Manual Bet */}
              {betMode === 'manual' && (
                <ManualBetControls
                  amount={amount}
                  balance={balance}
                  onAmountChange={setAmount}
                  onBet={handlePlaceBet}
                  disabled={!canBet}
                  loading={loading}
                />
              )}

              {/* Auto Bet */}
              {betMode === 'auto' && betModes.includes('auto') && (
                <AutoBetControls
                  amount={amount}
                  balance={balance}
                  onAmountChange={setAmount}
                  onStart={handleStartAutoBet}
                  onStop={stopAutoBet}
                  isActive={autoBetActive}
                  disabled={!canBet}
                />
              )}

              {/* Strategy */}
              {betMode === 'strategy' && betModes.includes('strategy') && (
                <div className="text-center py-8 text-gray-400">
                  Strategy mode coming soon...
                </div>
              )}
            </div>

            {/* Auto-Bet Status */}
            <AutoBetStatus active={autoBetActive} />

            {/* Live Stats */}
            <LiveStats stats={stats} onReset={resetStats} />
          </div>
        </div>
      </div>

      {/* Fairness Modal */}
      <FairnessModal
        isOpen={fairnessModalOpen}
        onClose={() => setFairnessModalOpen(false)}
      />
    </div>
  );
}