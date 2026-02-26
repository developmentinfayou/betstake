import './chess.css';

interface ChessGameControlsProps {
    whiteTime: number;   // ms
    blackTime: number;   // ms
    currentTurn: 'white' | 'black';
    playerColor: 'white' | 'black';
    isGameOver: boolean;
    pgn: string;
    moveCount: number;
    onResign: () => void;
    onOfferDraw: () => void;
    drawOffered?: boolean;
    onAcceptDraw?: () => void;
    onDeclineDraw?: () => void;
    gameResult?: {
        winner?: string;
        winnerUsername?: string;
        endReason?: string;
        isDraw?: boolean;
        payout?: number;
    };
    players: { white: string; black: string };
}

function formatTime(ms: number): string {
    if (ms <= 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getTimeClass(ms: number): string {
    if (ms <= 10000) return 'critical';
    if (ms <= 30000) return 'warning';
    return '';
}

export default function ChessGameControls({
    whiteTime,
    blackTime,
    currentTurn,
    playerColor,
    isGameOver,
    pgn,
    moveCount,
    onResign,
    onOfferDraw,
    drawOffered,
    onAcceptDraw,
    onDeclineDraw,
    gameResult,
    players,
}: ChessGameControlsProps) {
    // Parse PGN into move list
    const moves = parsePgnMoves(pgn);

    const opponentColor = playerColor === 'white' ? 'black' : 'white';

    return (
        <div className="chess-controls" id="chess-controls">
            {/* Opponent Clock (top) */}
            <div className={`chess-clock ${currentTurn === opponentColor && !isGameOver ? 'active' : ''} ${getTimeClass(opponentColor === 'white' ? whiteTime : blackTime)}`} id="opponent-clock">
                <div className="clock-label">{players[opponentColor]} ({opponentColor})</div>
                <div className="clock-time">
                    {formatTime(opponentColor === 'white' ? whiteTime : blackTime)}
                </div>
            </div>

            {/* Game Status */}
            <div className="game-status-panel" id="game-status">
                {isGameOver && gameResult ? (
                    <div className="game-result">
                        <div className={`result-badge ${gameResult.isDraw ? 'draw' : 'win'}`}>
                            {gameResult.isDraw ? '½ - ½ DRAW' :
                                gameResult.winnerUsername ? `${gameResult.winnerUsername} wins!` : 'Game Over'}
                        </div>
                        <div className="result-reason">{formatEndReason(gameResult.endReason)}</div>
                        {gameResult.payout && (
                            <div className="result-payout">
                                Payout: <span className="payout-amount">${gameResult.payout.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="turn-indicator">
                        <div className={`turn-dot ${currentTurn}`} />
                        <span>{currentTurn === playerColor ? 'Your turn' : "Opponent's turn"}</span>
                    </div>
                )}
            </div>

            {/* Move History */}
            <div className="move-history" id="move-history">
                <h4>Moves ({moveCount})</h4>
                <div className="move-list">
                    {moves.length === 0 ? (
                        <div className="no-moves">No moves yet</div>
                    ) : (
                        moves.map((movePair, i) => (
                            <div key={i} className="move-row">
                                <span className="move-number">{i + 1}.</span>
                                <span className="move-white">{movePair[0]}</span>
                                {movePair[1] && <span className="move-black">{movePair[1]}</span>}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Draw Offer Banner */}
            {drawOffered && !isGameOver && (
                <div className="draw-offer-banner" id="draw-offer">
                    <span>Draw offered!</span>
                    <div className="draw-actions">
                        <button className="btn-accept-draw" onClick={onAcceptDraw}>Accept</button>
                        <button className="btn-decline-draw" onClick={onDeclineDraw}>Decline</button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {!isGameOver && (
                <div className="chess-actions" id="chess-actions">
                    <button className="btn-draw" onClick={onOfferDraw} id="offer-draw-btn">
                        ½ Offer Draw
                    </button>
                    <button className="btn-resign" onClick={onResign} id="resign-btn">
                        🏳 Resign
                    </button>
                </div>
            )}

            {/* Player Clock (bottom) */}
            <div className={`chess-clock ${currentTurn === playerColor && !isGameOver ? 'active' : ''} ${getTimeClass(playerColor === 'white' ? whiteTime : blackTime)}`} id="player-clock">
                <div className="clock-label">{players[playerColor]} ({playerColor})</div>
                <div className="clock-time">
                    {formatTime(playerColor === 'white' ? whiteTime : blackTime)}
                </div>
            </div>
        </div>
    );
}

function parsePgnMoves(pgn: string): string[][] {
    if (!pgn) return [];
    // Remove headers and result
    const cleaned = pgn
        .replace(/\[.*?\]/g, '')
        .replace(/\{.*?\}/g, '')
        .replace(/(1-0|0-1|1\/2-1\/2|\*)$/g, '')
        .trim();

    if (!cleaned) return [];

    // Split by move numbers
    const tokens = cleaned.split(/\d+\./).filter(t => t.trim());
    const result: string[][] = [];

    for (const token of tokens) {
        const parts = token.trim().split(/\s+/).filter(Boolean);
        result.push(parts);
    }

    return result;
}

function formatEndReason(reason?: string): string {
    switch (reason) {
        case 'checkmate': return 'by Checkmate';
        case 'timeout': return 'by Timeout';
        case 'resignation': return 'by Resignation';
        case 'abandonment': return 'by Abandonment';
        case 'stalemate': return 'Stalemate';
        case 'agreement': return 'by Agreement';
        case 'threefold repetition': return 'Threefold Repetition';
        case 'insufficient material': return 'Insufficient Material';
        case 'draw': return 'Draw';
        default: return reason || '';
    }
}
