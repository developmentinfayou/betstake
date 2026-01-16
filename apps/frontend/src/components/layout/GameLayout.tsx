'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import FairnessModal from '@/components/games/FairnessModal';
import LiveStats from '@/components/games/LiveStats';
import AutoBetStatus from '@/components/games/AutoBetStatus';

interface GameLayoutProps {
  gameTitle: string;
  balance: number;
  children: ReactNode;
  sidebarContent: ReactNode;
  stats: {
    profit: number;
    wins: number;
    losses: number;
    wagered: number;
  };
  onResetStats: () => void;
  autoBetActive?: boolean;
  fairnessModalOpen: boolean;
  onFairnessModalToggle: (open: boolean) => void;
}

export default function GameLayout({
  gameTitle,
  balance,
  children,
  sidebarContent,
  stats,
  onResetStats,
  autoBetActive = false,
  fairnessModalOpen,
  onFairnessModalToggle,
}: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">
            ← {gameTitle}
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onFairnessModalToggle(true)}
              className="btn-secondary px-4 py-2"
            >
              🎲 Fairness
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-xl font-bold text-primary">${balance.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">{children}</div>
          
          <div className="space-y-6">
            {sidebarContent}
            
            <AutoBetStatus active={autoBetActive} />
            
            <LiveStats
              stats={stats}
              onReset={onResetStats}
            />
          </div>
        </div>
      </div>

      <FairnessModal
        isOpen={fairnessModalOpen}
        onClose={() => onFairnessModalToggle(false)}
      />
    </div>
  );
}