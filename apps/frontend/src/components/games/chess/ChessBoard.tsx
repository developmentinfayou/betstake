import { useState, useCallback, useMemo } from 'react';
import  {Chess}  from "chess.js";
import './chess.css';

interface ChessBoardProps {
    fen: string;
    playerColor: 'white' | 'black';
    isMyTurn: boolean;
    lastMove?: { from: string; to: string } | null;
    onMove: (move: { from: string; to: string; promotion?: string }) => void;
    disabled?: boolean;
}

const PIECE_UNICODE: Record<string, string> = {
    wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
    bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function ChessBoard({ fen, playerColor, isMyTurn, lastMove, onMove, disabled }: ChessBoardProps) {
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);

    const chess = useMemo(() => new Chess(fen), [fen]);
    const board = chess.board();

    const legalMoves = useMemo(() => {
        if (!selectedSquare || !isMyTurn || disabled) return [];
        return chess.moves({ square: selectedSquare as any, verbose: true });
    }, [selectedSquare, fen, isMyTurn, disabled]);

    const legalSquares = useMemo(() => new Set(legalMoves.map((m:any) => m.to)), [legalMoves]);

    // Determine display order based on player color
    const displayRanks = playerColor === 'black' ? [...RANKS].reverse() : RANKS;
    const displayFiles = playerColor === 'black' ? [...FILES].reverse() : FILES;

    const handleSquareClick = useCallback((square: string) => {
        if (disabled || !isMyTurn) return;

        // If a piece is selected and this is a legal target
        if (selectedSquare && legalSquares.has(square)) {
            // Check for pawn promotion
            const piece = chess.get(selectedSquare as any);
            const targetRank = square[1];
            if (piece?.type === 'p' && (targetRank === '8' || targetRank === '1')) {
                setPromotionPending({ from: selectedSquare, to: square });
                return;
            }

            onMove({ from: selectedSquare, to: square });
            setSelectedSquare(null);
            return;
        }

        // Select a piece
        const piece = chess.get(square as any);
        if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
            setSelectedSquare(square);
        } else {
            setSelectedSquare(null);
        }
    }, [selectedSquare, legalSquares, isMyTurn, disabled, chess, playerColor, onMove]);

    const handlePromotion = useCallback((piece: string) => {
        if (promotionPending) {
            onMove({ ...promotionPending, promotion: piece });
            setPromotionPending(null);
            setSelectedSquare(null);
        }
    }, [promotionPending, onMove]);

    const isCheck = chess.isCheck();
    const kingInCheck = isCheck ? findKing(board, chess.turn()) : null;

    return (
        <div className="chess-board-wrapper">
            <div className="chess-board" id="chess-board">
                {/* Rank labels (left side) */}
                <div className="board-labels-ranks">
                    {displayRanks.map(rank => (
                        <div key={rank} className="rank-label">{rank}</div>
                    ))}
                </div>

                <div className="board-grid">
                    {displayRanks.map((rank, ri) =>
                        displayFiles.map((file, fi) => {
                            const square = `${file}${rank}`;
                            const isLight = (fi + ri) % 2 === 0;
                            const piece = chess.get(square as any);
                            const isSelected = selectedSquare === square;
                            const isLegalTarget = legalSquares.has(square);
                            const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
                            const isKingCheck = kingInCheck === square;

                            let className = `chess-square ${isLight ? 'light' : 'dark'}`;
                            if (isSelected) className += ' selected';
                            if (isLastMoveSquare) className += ' last-move';
                            if (isKingCheck) className += ' in-check';

                            return (
                                <div
                                    key={square}
                                    className={className}
                                    data-square={square}
                                    onClick={() => handleSquareClick(square)}
                                >
                                    {piece && (
                                        <span className={`chess-piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`}>
                                            {PIECE_UNICODE[`${piece.color}${piece.type}`]}
                                        </span>
                                    )}
                                    {isLegalTarget && (
                                        <span className={`legal-move-dot ${piece ? 'capture' : ''}`} />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* File labels (bottom) */}
                <div className="board-labels-files">
                    <div className="spacer" />
                    {displayFiles.map(file => (
                        <div key={file} className="file-label">{file}</div>
                    ))}
                </div>
            </div>

            {/* Promotion Dialog */}
            {promotionPending && (
                <div className="promotion-overlay" id="promotion-dialog">
                    <div className="promotion-dialog">
                        <h4>Promote to:</h4>
                        <div className="promotion-options">
                            {['q', 'r', 'b', 'n'].map(p => (
                                <button
                                    key={p}
                                    className="promotion-btn"
                                    onClick={() => handlePromotion(p)}
                                >
                                    {PIECE_UNICODE[`${playerColor === 'white' ? 'w' : 'b'}${p}`]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function findKing(board: any[][], turn: string): string | null {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.type === 'k' && piece.color === turn) {
                return `${FILES[col]}${8 - row}`;
            }
        }
    }
    return null;
}
