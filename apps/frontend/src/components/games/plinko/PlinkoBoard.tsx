'use client';

import { useState, useEffect, useRef } from 'react';

interface PlinkoBoardProps {
  rows: number;
  risk: 'low' | 'medium' | 'high' | 'lightning-low' | 'lightning-medium' | 'lightning-high';
  result?: {
    path: number[];
    finalSlot: number;
    multiplier: number;
    goldenPegs?: Array<{ row: number; position: number; multiplier: number }>;
    deadZones?: number[];
    goldenPegHits?: Array<{ row: number; position: number; multiplier: number }>;
  };
  isDropping: boolean;
  superMode?: boolean;
  goldenPegs?: Array<{ row: number; position: number; multiplier: number }>;
  deadZones?: number[];
}

export default function PlinkoBoard({ rows, risk, result, isDropping, superMode, goldenPegs, deadZones }: PlinkoBoardProps) {
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 0 });
  const [animationKey, setAnimationKey] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  const isLightningMode = risk.startsWith('lightning-');

  // Generate multipliers based on risk and rows
  const getMultipliers = () => {
    const baseRisk = risk.replace('lightning-', '') as 'low' | 'medium' | 'high';
    const multipliers: { [key: string]: number[] } = {
      low: {
        8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
        12: [8.9, 3, 1.4, 1.1, 1, 0.5, 0.3, 0.5, 1, 1.1, 1.4, 3, 8.9],
        16: [16, 9, 2, 1.4, 1.1, 1, 0.5, 0.3, 0.3, 0.5, 1, 1.1, 1.4, 2, 9, 16]
      },
      medium: {
        8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
        12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
        16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.5, 1, 1.5, 3, 5, 10, 41, 110]
      },
      high: {
        8: [29, 4, 1.5, 0.4, 0.2, 0.4, 1.5, 4, 29],
        12: [141, 23, 8, 3, 1.3, 0.4, 0.1, 0.4, 1.3, 3, 8, 23, 141],
        16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
      }
    };
    
    const baseMultipliers = multipliers[baseRisk][rows as keyof typeof multipliers[typeof baseRisk]] || multipliers[baseRisk][12];
    return superMode ? baseMultipliers.map(m => m * 1.5) : baseMultipliers;
  };

  const multipliers = getMultipliers();

  const isGoldenPeg = (rowIndex: number, pegIndex: number) => {
    if (!goldenPegs) return false;
    return goldenPegs.some(peg => peg.row === rowIndex && peg.position === pegIndex);
  };

  const getGoldenPegMultiplier = (rowIndex: number, pegIndex: number) => {
    if (!goldenPegs) return 0;
    const peg = goldenPegs.find(p => p.row === rowIndex && p.position === pegIndex);
    return peg?.multiplier || 0;
  };

  useEffect(() => {
    if (isDropping && result) {
      setAnimationKey(prev => prev + 1);
      animateBall();
    }
  }, [isDropping, result]);

  const animateBall = () => {
    if (!result || !boardRef.current) return;
    
    const boardWidth = boardRef.current.offsetWidth;
    const pegSpacing = boardWidth / (rows + 1);
    let currentX = boardWidth / 2;
    let currentY = 0;
    
    const animateStep = (stepIndex: number) => {
      if (stepIndex >= result.path.length) {
        // Final position
        const finalX = (result.finalSlot * (boardWidth / multipliers.length)) + (boardWidth / multipliers.length / 2);
        setBallPosition({ x: (finalX / boardWidth) * 100, y: 95 });
        return;
      }
      
      const direction = result.path[stepIndex];
      currentX += direction === 0 ? -pegSpacing/2 : pegSpacing/2;
      currentY += (100 / (rows + 2));
      
      setBallPosition({ 
        x: Math.max(5, Math.min(95, (currentX / boardWidth) * 100)), 
        y: Math.min(90, currentY) 
      });
      
      setTimeout(() => animateStep(stepIndex + 1), 150);
    };
    
    setTimeout(() => animateStep(0), 100);
  };

  const getSlotColor = (multiplier: number) => {
    if (multiplier >= 10) return 'bg-gradient-to-t from-red-600 to-red-400 text-white';
    if (multiplier >= 3) return 'bg-gradient-to-t from-orange-600 to-orange-400 text-white';
    if (multiplier >= 1) return 'bg-gradient-to-t from-yellow-600 to-yellow-400 text-black';
    return 'bg-gradient-to-t from-blue-600 to-blue-400 text-white';
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Plinko Board */}
      <div 
        ref={boardRef}
        className="relative bg-gray-800 rounded-lg p-4 min-h-[400px] border-2 border-gray-700"
        style={{ aspectRatio: '4/3' }}
      >
        {/* Pegs */}
        <div className="absolute inset-4">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div 
              key={rowIndex}
              className="absolute flex justify-center"
              style={{ 
                top: `${((rowIndex + 1) / (rows + 2)) * 100}%`,
                left: '0',
                right: '0'
              }}
            >
              {Array.from({ length: rowIndex + 2 }, (_, pegIndex) => {
                const golden = isGoldenPeg(rowIndex, pegIndex);
                const multiplier = getGoldenPegMultiplier(rowIndex, pegIndex);
                
                return (
                  <div key={pegIndex} className="relative">
                    <div
                      className={`w-3 h-3 rounded-full mx-1 transition-all ${
                        golden 
                          ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-lg shadow-yellow-500/50 animate-pulse' 
                          : 'bg-white shadow-lg shadow-white/30'
                      }`}
                      style={{
                        marginLeft: `${100 / (rowIndex + 3)}%`,
                        marginRight: `${100 / (rowIndex + 3)}%`
                      }}
                    />
                    {golden && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-yellow-400 whitespace-nowrap">
                        {multiplier}x
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Ball */}
        {isDropping && (
          <div
            key={animationKey}
            className={`absolute w-4 h-4 rounded-full transition-all duration-150 z-10 ${
              superMode ? 'bg-gradient-to-r from-special to-secondary' : 'bg-white'
            }`}
            style={{
              left: `${ballPosition.x}%`,
              top: `${ballPosition.y}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}
          />
        )}

        {/* Ball Trail Effect */}
        {result && !isDropping && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d={`M ${50}% 5% ${result.path.map((direction, index) => {
                const y = ((index + 2) / (rows + 2)) * 100;
                const x = 50 + (result.path.slice(0, index + 1).reduce((sum, d) => sum + (d === 0 ? -1 : 1), 0) * (100 / (rows + 1)) / 2);
                return `L ${Math.max(5, Math.min(95, x))}% ${y}%`;
              }).join(' ')}`}
              stroke={superMode ? '#73FFD7' : '#FFC100'}
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.7"
            />
          </svg>
        )}
      </div>

      {/* Multiplier Slots */}
      <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `repeat(${multipliers.length}, 1fr)` }}>
        {multipliers.map((multiplier, index) => {
          const isDead = deadZones?.includes(index);
          
          return (
            <div
              key={index}
              className={`py-2 px-1 text-center text-xs font-bold rounded transition-all ${
                isDead 
                  ? 'bg-gradient-to-t from-red-900 to-red-700 text-white border-2 border-red-500' 
                  : getSlotColor(multiplier)
              } ${
                result && result.finalSlot === index ? 'ring-2 ring-white animate-pulse' : ''
              }`}
            >
              {isDead ? '💀' : (
                multiplier >= 1000 ? `${(multiplier/1000).toFixed(0)}k` : 
                multiplier >= 100 ? multiplier.toFixed(0) : 
                multiplier.toFixed(1)
              )}x
            </div>
          );
        })}
      </div>

      {/* Result Display */}
      {result && !isDropping && (
        <div className="text-center mt-4">
          <div className="text-2xl font-bold mb-2">
            Slot {result.finalSlot + 1} • {result.multiplier}x
          </div>
          <div className="text-sm text-gray-400">
            Path: {result.path.map(d => d === 0 ? '←' : '→').join(' ')}
          </div>
        </div>
      )}
    </div>
  );
}