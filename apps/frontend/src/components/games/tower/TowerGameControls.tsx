import { useState, useEffect } from 'react';

export type TowerDifficulty = 'easy' | 'medium' | 'hard' | 'extreme' | 'nightmare';

export interface TowerGameParams {
  difficulty: TowerDifficulty;
  selectedTiles: number[];
}

interface TowerGameControlsProps {
  onChange: (params: TowerGameParams) => void;
  difficulty: TowerDifficulty;
  onDifficultyChange: (d: TowerDifficulty) => void;
  disabled?: boolean;
  tilesPerFloor: number;
  dangersPerFloor: number;
  floors: number;
  currentFloor: number;
  revealedTiles?: number[];
  dangerTiles?: number[];
  allDangerTiles?: number[];
  onTileClick?: (index: number) => void;
  gameActive?: boolean;
  gameOver?: boolean;
  multiplierTable?: number[];
  isAutoMode?: boolean;
  autoBetActive?: boolean;
}

const DIFFICULTY_META: Record<TowerDifficulty, { label: string; icon: string; color: string; desc: string }> = {
  easy: { label: 'Easy', icon: '🟢', color: '#22c55e', desc: '3 safe / 1 trap' },
  medium: { label: 'Medium', icon: '🟡', color: '#eab308', desc: '2 safe / 1 trap' },
  hard: { label: 'Hard', icon: '🟠', color: '#f97316', desc: '1 safe / 1 trap' },
  extreme: { label: 'Extreme', icon: '🔴', color: '#ef4444', desc: '1 safe / 2 trap' },
  nightmare: { label: 'Nightmare', icon: '💀', color: '#a855f7', desc: '1 safe / 3 trap' },
};

const ALL_DIFFICULTIES: TowerDifficulty[] = ['easy', 'medium', 'hard', 'extreme', 'nightmare'];

export default function TowerGameControls({
  onChange,
  difficulty,
  onDifficultyChange,
  disabled = false,
  tilesPerFloor,
  floors,
  currentFloor,
  revealedTiles = [],
  dangerTiles = [],
  allDangerTiles = [],
  onTileClick,
  gameActive = false,
  gameOver = false,
  multiplierTable = [],
  isAutoMode = false,
  autoBetActive = false,
}: TowerGameControlsProps) {
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);

  useEffect(() => {
    onChange({ difficulty, selectedTiles });
  }, [difficulty, selectedTiles]);

  const handleTileClick = (index: number) => {
    if (disabled || autoBetActive) return;

    if (isAutoMode && !gameActive) {
      // Auto mode pre-selection: one tile per floor
      const floor = Math.floor(index / tilesPerFloor);

      if (selectedTiles.includes(index)) {
        // Deselect this tile and all tiles on floors above it
        setSelectedTiles(selectedTiles.filter(t => {
          const tFloor = Math.floor(t / tilesPerFloor);
          return tFloor < floor;
        }));
      } else {
        // Check if this floor already has a selected tile — replace it
        const withoutFloor = selectedTiles.filter(t => {
          const tFloor = Math.floor(t / tilesPerFloor);
          return tFloor !== floor;
        });

        // Only allow selecting if all floors below are already selected
        const floorsSelected = withoutFloor.map(t => Math.floor(t / tilesPerFloor));
        const canSelect = floor === 0 || floorsSelected.includes(floor - 1);

        if (!canSelect) {
          // Fill in missing floors below with first tile of each floor
          const filled = [...withoutFloor];
          for (let f = 0; f < floor; f++) {
            if (!floorsSelected.includes(f)) {
              // No tile on this floor yet - no auto fill, just block
              return; // Can't select — must select lower floors first
            }
          }
        }

        setSelectedTiles([...withoutFloor, index].sort((a, b) => a - b));
      }
    } else if (gameActive && onTileClick && !gameOver) {
      // Manual mode — only allow clicking current floor
      const floorStart = currentFloor * tilesPerFloor;
      const floorEnd = floorStart + tilesPerFloor - 1;
      if (index < floorStart || index > floorEnd) return;
      onTileClick(index);
    }
  };

  const getTileState = (index: number, floor: number): 'hidden' | 'safe' | 'danger' | 'active' | 'revealed-danger' | 'selected' => {
    if (dangerTiles.includes(index)) return 'danger';
    if (revealedTiles.includes(index)) return 'safe';
    if (gameOver && allDangerTiles.includes(index)) return 'revealed-danger';
    if (isAutoMode && !gameActive && selectedTiles.includes(index)) return 'selected';
    if (gameActive && floor === currentFloor) return 'active';
    return 'hidden';
  };

  const getTileStyle = (state: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '18px',
      cursor: 'default',
      transition: 'all 0.2s ease',
      minHeight: '48px',
      border: '2px solid transparent',
    };

    switch (state) {
      case 'safe':
        return { ...base, background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', boxShadow: '0 0 12px rgba(34,197,94,0.4)' };
      case 'danger':
        return { ...base, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', boxShadow: '0 0 12px rgba(239,68,68,0.5)', animation: 'shake 0.5s ease-in-out' };
      case 'revealed-danger':
        return { ...base, background: '#3f3f46', color: '#a1a1aa', border: '2px solid #52525b' };
      case 'selected':
        return { ...base, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', cursor: 'pointer', boxShadow: '0 0 10px rgba(59,130,246,0.4)', border: '2px solid #60a5fa' };
      case 'active':
        return { ...base, background: '#1e293b', border: '2px solid #3b82f6', cursor: 'pointer', boxShadow: '0 0 8px rgba(59,130,246,0.3)' };
      default: // hidden
        const clickable = isAutoMode && !gameActive && !autoBetActive;
        return { ...base, background: '#1e1e2e', color: '#4a4a5a', cursor: clickable ? 'pointer' : 'default' };
    }
  };

  const getTileContent = (index: number, state: string) => {
    if (state === 'danger') return '💣';
    if (state === 'safe') return '⭐';
    if (state === 'revealed-danger') return '✕';
    if (state === 'selected') return '✓';
    if (state === 'active') return '?';
    return '';
  };

  // How many floors are selected for autobet
  const selectedFloorCount = new Set(selectedTiles.map(t => Math.floor(t / tilesPerFloor))).size;

  // Render floors from top to bottom (floor index 8 at top, 0 at bottom)
  const floorRows = [];
  for (let floor = floors - 1; floor >= 0; floor--) {
    const floorStart = floor * tilesPerFloor;
    const isCurrentFloor = gameActive && floor === currentFloor;
    const isCleared = floor < currentFloor;
    const multiplier = multiplierTable[floor] || 0;

    floorRows.push(
      <div key={floor} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: (gameActive && floor > currentFloor && !gameOver) ? 0.4 : 1,
        transition: 'opacity 0.3s ease',
      }}>
        {/* Multiplier label */}
        <div style={{
          width: '72px',
          textAlign: 'right',
          fontSize: '12px',
          fontWeight: isCurrentFloor ? 'bold' : 'normal',
          color: isCleared ? '#22c55e' : isCurrentFloor ? '#3b82f6' : '#6b7280',
          flexShrink: 0,
        }}>
          {multiplier > 0 ? `${multiplier.toFixed(2)}x` : ''}
        </div>

        {/* Floor indicator */}
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isCleared ? '#22c55e' : isCurrentFloor ? '#3b82f6' : '#374151',
          flexShrink: 0,
          boxShadow: isCurrentFloor ? '0 0 8px rgba(59,130,246,0.6)' : 'none',
        }} />

        {/* Tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${tilesPerFloor}, 1fr)`,
          gap: '6px',
          flex: 1,
        }}>
          {Array.from({ length: tilesPerFloor }, (_, tile) => {
            const index = floorStart + tile;
            const state = getTileState(index, floor);
            return (
              <button
                key={index}
                onClick={() => handleTileClick(index)}
                disabled={disabled || (gameActive && state !== 'active' && state !== 'selected')}
                style={getTileStyle(state)}
              >
                {getTileContent(index, state)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Difficulty selector - only show when not in game */}
      {!gameActive && !gameOver && (
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>
            Select Difficulty
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px',
            background: '#111827',
            borderRadius: '12px',
            padding: '4px',
          }}>
            {ALL_DIFFICULTIES.map(d => {
              const meta = DIFFICULTY_META[d];
              const isSelected = difficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => onDifficultyChange(d)}
                  disabled={disabled || autoBetActive}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: (disabled || autoBetActive) ? 'not-allowed' : 'pointer',
                    background: isSelected ? meta.color + '22' : 'transparent',
                    color: isSelected ? meta.color : '#9ca3af',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    fontSize: '11px',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    borderBottom: isSelected ? `2px solid ${meta.color}` : '2px solid transparent',
                  }}
                >
                  <div>{meta.icon}</div>
                  <div>{meta.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active difficulty badge during game */}
      {(gameActive || gameOver) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: DIFFICULTY_META[difficulty].color + '15',
          borderRadius: '8px',
          border: `1px solid ${DIFFICULTY_META[difficulty].color}30`,
        }}>
          <span>{DIFFICULTY_META[difficulty].icon}</span>
          <span style={{ color: DIFFICULTY_META[difficulty].color, fontWeight: 'bold', fontSize: '14px' }}>
            {DIFFICULTY_META[difficulty].label}
          </span>
          <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: 'auto' }}>
            {DIFFICULTY_META[difficulty].desc}
          </span>
        </div>
      )}

      {/* AutoBet selection info */}
      {isAutoMode && !gameActive && (
        <div style={{
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>AutoBet Configuration</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6', marginTop: '4px' }}>
            {selectedFloorCount} floor{selectedFloorCount !== 1 ? 's' : ''} selected
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
            {selectedFloorCount > 0
              ? `Will auto-cashout at floor ${selectedFloorCount} (${multiplierTable[selectedFloorCount - 1]?.toFixed(2) || '?'}x)`
              : 'Click one tile per floor from bottom up'}
          </div>
        </div>
      )}

      {/* Tower Grid */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '16px',
        background: '#0f172a',
        borderRadius: '12px',
        border: '1px solid #1e293b',
      }}>
        {/* Floor header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          padding: '0 4px',
        }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Multiplier</span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            Floor {gameActive ? currentFloor + 1 : 0} / {floors}
          </span>
        </div>

        {floorRows}
      </div>
    </div>
  );
}
