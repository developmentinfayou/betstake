import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import "./rps.css";

interface RPSGameComponentProps {
    gameId: string;
    userId: string;
    username: string;
    onGameEnd: () => void;
}

interface RoundResult {
    roundNumber: number;
    player1Choice: string;
    player2Choice: string;
    roundWinner: string;
    scores: Record<string, number>;
}

type GamePhase = "connecting" | "waiting" | "countdown" | "picking" | "revealing" | "gameOver";

const CHOICES = [
    { id: "ROCK", emoji: "✊", label: "Rock" },
    { id: "PAPER", emoji: "✋", label: "Paper" },
    { id: "SCISSORS", emoji: "✌️", label: "Scissors" },
];

export default function RPSGameComponent({ gameId, userId, username, onGameEnd }: RPSGameComponentProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [phase, setPhase] = useState<GamePhase>("connecting");
    const [room, setRoom] = useState<any>(null);
    const [gameState, setGameState] = useState<any>(null);
    const [myChoice, setMyChoice] = useState<string | null>(null);
    const [opponentPicked, setOpponentPicked] = useState(false);
    const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
    const [currentRound, setCurrentRound] = useState(1);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [timer, setTimer] = useState(10);
    const [gameResult, setGameResult] = useState<any>(null);
    const [shareableLink, setShareableLink] = useState("");

    // Connect to socket
    useEffect(() => {
        const newSocket = io("http://localhost:3001/rps", {
            transports: ["websocket", "polling"],
        });

        newSocket.on("connect", () => {
            console.log("[RPS] Connected, joining game:", gameId);
            newSocket.emit("join-game", { gameId, userId, username });
        });

        newSocket.on("game-joined", (data) => {
            setRoom(data.room);
            setShareableLink(`${window.location.origin}/game/rps/join/${gameId}`);
            if (data.gameState) {
                setGameState(data.gameState);
                setScores(data.gameState.scores || {});
                setCurrentRound(data.gameState.currentRound || 1);
                setPhase("picking");
            } else {
                setPhase("waiting");
            }
        });

        newSocket.on("player-joined", (data) => {
            setRoom(data.room);
            toast.success(`${data.player.username} joined!`);
        });

        newSocket.on("game-started", (data) => {
            setGameState(data.gameState);
            setScores(data.gameState.scores || {});
            setPhase("countdown");
            toast.success("Game started!");
        });

        newSocket.on("round-started", (data) => {
            setCurrentRound(data.roundNumber);
            setMyChoice(null);
            setOpponentPicked(false);
            setRoundResult(null);
            setTimer(data.timeLimit);
            setPhase("picking");
        });

        newSocket.on("opponent-picked", () => {
            setOpponentPicked(true);
        });

        newSocket.on("round-result", (data: RoundResult) => {
            setRoundResult(data);
            setScores(data.scores);
            setPhase("revealing");
        });

        newSocket.on("game-ended", (data) => {
            setGameResult(data);
            setPhase("gameOver");
        });

        newSocket.on("player-forfeited", (data) => {
            toast.error(`Opponent forfeited!`);
        });

        newSocket.on("error", (data) => {
            toast.error(data.message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [gameId, userId, username]);

    // Timer countdown
    useEffect(() => {
        if (phase !== "picking" || timer <= 0) return;

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [phase, timer]);

    const submitChoice = useCallback(
        (choice: string) => {
            if (!socket || phase !== "picking" || myChoice) return;
            setMyChoice(choice);
            socket.emit("submit-choice", { gameId, userId, choice });
        },
        [socket, phase, myChoice, gameId, userId]
    );

    const handleLeave = () => {
        if (socket) {
            socket.emit("leave-game", { userId });
        }
        onGameEnd();
    };

    const copyLink = () => {
        navigator.clipboard.writeText(shareableLink);
        toast.success("Link copied!");
    };

    // Get player info
    const players = room?.players || [];
    const opponent = players.find((p: any) => p.userId !== userId);
    const me = players.find((p: any) => p.userId === userId);

    const getChoiceEmoji = (choice: string | null) => {
        if (!choice) return "❓";
        const c = CHOICES.find((ch) => ch.id === choice);
        return c ? c.emoji : "❓";
    };

    const isWinner = (playerId: string) => {
        return roundResult?.roundWinner === playerId;
    };

    // ─── Waiting Phase ───
    if (phase === "connecting") {
        return (
            <div className="rps-container">
                <div className="rps-card rps-center">
                    <div className="rps-spinner"></div>
                    <p className="rps-text-muted mt-4">Connecting...</p>
                </div>
            </div>
        );
    }

    if (phase === "waiting") {
        return (
            <div className="rps-container">
                <div className="rps-card rps-center">
                    <div className="rps-waiting-icon">⏳</div>
                    <h2 className="rps-title">Waiting for Opponent</h2>
                    <p className="rps-text-muted mb-4">Share this link to invite a friend:</p>
                    <div className="rps-link-box">
                        <code className="rps-link-text">{shareableLink}</code>
                        <button onClick={copyLink} className="rps-btn-copy">📋 Copy</button>
                    </div>
                    <div className="rps-info-row mt-4">
                        <span>Mode: <strong>{room?.mode?.toUpperCase()}</strong></span>
                        <span>Bet: <strong>${room?.betAmount}</strong></span>
                    </div>
                    <button onClick={handleLeave} className="rps-btn-secondary mt-4">Leave Game</button>
                </div>
            </div>
        );
    }

    // ─── Game Phase ───
    return (
        <div className="rps-container">
            {/* Score Bar */}
            <div className="rps-scorebar">
                <div className="rps-player-score">
                    <span className="rps-player-name">{me?.username || "You"}</span>
                    <span className="rps-score">{scores[userId] || 0}</span>
                </div>
                <div className="rps-round-info">
                    <span className="rps-round-label">Round {currentRound}</span>
                    <span className="rps-mode-label">{room?.mode?.toUpperCase()}</span>
                </div>
                <div className="rps-player-score rps-opponent-score">
                    <span className="rps-score">{opponent ? (scores[opponent.userId] || 0) : 0}</span>
                    <span className="rps-player-name">{opponent?.username || "Opponent"}</span>
                </div>
            </div>

            {/* Game Arena */}
            <div className="rps-arena">
                {/* Opponent Side */}
                <div className="rps-side rps-opponent-side">
                    <div className="rps-player-label">{opponent?.username || "Opponent"}</div>
                    <div className={`rps-hand-display ${phase === "revealing" ? "rps-reveal" : ""} ${phase === "revealing" && isWinner(opponent?.userId) ? "rps-winner-glow" : ""
                        }`}>
                        {phase === "revealing" && roundResult
                            ? getChoiceEmoji(
                                players[0]?.userId === opponent?.userId
                                    ? roundResult.player1Choice
                                    : roundResult.player2Choice
                            )
                            : opponentPicked
                                ? "✅"
                                : "🤔"}
                    </div>
                    {opponentPicked && phase === "picking" && (
                        <div className="rps-picked-label">Locked in!</div>
                    )}
                </div>

                {/* VS Divider */}
                <div className="rps-vs">
                    {phase === "picking" && (
                        <div className="rps-timer-ring">
                            <svg viewBox="0 0 100 100">
                                <circle
                                    cx="50" cy="50" r="45"
                                    className="rps-timer-bg"
                                />
                                <circle
                                    cx="50" cy="50" r="45"
                                    className="rps-timer-fill"
                                    style={{
                                        strokeDashoffset: `${283 - (283 * timer) / 10}`,
                                    }}
                                />
                            </svg>
                            <span className={`rps-timer-text ${timer <= 3 ? "rps-timer-danger" : ""}`}>
                                {timer}
                            </span>
                        </div>
                    )}
                    {phase === "revealing" && (
                        <div className="rps-vs-text">VS</div>
                    )}
                    {phase === "countdown" && (
                        <div className="rps-countdown">GET READY</div>
                    )}
                </div>

                {/* My Side */}
                <div className="rps-side rps-my-side">
                    <div className={`rps-hand-display ${phase === "revealing" ? "rps-reveal" : ""} ${phase === "revealing" && isWinner(userId) ? "rps-winner-glow" : ""
                        }`}>
                        {phase === "revealing" && roundResult
                            ? getChoiceEmoji(
                                players[0]?.userId === userId
                                    ? roundResult.player1Choice
                                    : roundResult.player2Choice
                            )
                            : myChoice
                                ? getChoiceEmoji(myChoice)
                                : "🤔"}
                    </div>
                    <div className="rps-player-label">{me?.username || "You"}</div>
                </div>
            </div>

            {/* Choice Buttons */}
            {phase === "picking" && !myChoice && (
                <div className="rps-choices">
                    {CHOICES.map((choice) => (
                        <button
                            key={choice.id}
                            onClick={() => submitChoice(choice.id)}
                            className="rps-choice-btn"
                        >
                            <span className="rps-choice-emoji">{choice.emoji}</span>
                            <span className="rps-choice-label">{choice.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {phase === "picking" && myChoice && (
                <div className="rps-waiting-reveal">
                    <p>You picked <strong>{getChoiceEmoji(myChoice)}</strong> — waiting for opponent...</p>
                </div>
            )}

            {/* Round Result Banner */}
            {phase === "revealing" && roundResult && (
                <div className={`rps-result-banner ${roundResult.roundWinner === userId ? "rps-win" :
                        roundResult.roundWinner === "draw" ? "rps-draw" : "rps-lose"
                    }`}>
                    {roundResult.roundWinner === userId
                        ? "🎉 You won this round!"
                        : roundResult.roundWinner === "draw"
                            ? "🤝 Draw!"
                            : "😔 You lost this round"}
                </div>
            )}

            {/* Game Over */}
            {phase === "gameOver" && gameResult && (
                <div className="rps-game-over">
                    <div className={`rps-game-over-card ${gameResult.winner === userId ? "rps-victory" :
                            gameResult.winner === "draw" ? "rps-draw-result" : "rps-defeat"
                        }`}>
                        <div className="rps-game-over-icon">
                            {gameResult.winner === userId ? "🏆" : gameResult.winner === "draw" ? "🤝" : "💀"}
                        </div>
                        <h2 className="rps-game-over-title">
                            {gameResult.winner === userId ? "VICTORY!" :
                                gameResult.winner === "draw" ? "DRAW!" : "DEFEAT"}
                        </h2>
                        {gameResult.payout > 0 && gameResult.winner === userId && (
                            <div className="rps-payout">
                                +${gameResult.payout.toFixed(2)}
                            </div>
                        )}
                        {gameResult.winner === "draw" && (
                            <div className="rps-refund">Bet refunded</div>
                        )}
                        <button onClick={onGameEnd} className="rps-btn-primary mt-4">
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* Leave button */}
            {phase !== "gameOver" && (
                <div className="rps-footer">
                    <button onClick={handleLeave} className="rps-btn-secondary">
                        Forfeit
                    </button>
                </div>
            )}
        </div>
    );
}
