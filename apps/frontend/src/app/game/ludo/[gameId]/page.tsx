"use client";

import { useState, useEffect } from 'react';
import { walletAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import LudoGame from '@/components/LudoGameNew';

export default function LudoGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");

  const [room, setRoom] = useState<any>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [validMoves, setValidMoves] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [shareableLink, setShareableLink] = useState("");

  useEffect(() => {
    loadBalance();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    setUserId(payload.id);
    setUsername(payload.username || 'Player');
    setIsLoading(false);
  }, []);
    setUsername(payload.username || "Player");

    const newSocket = io("http://localhost:3001/ludo", {
      transports: ["websocket", "polling"],
    });

    // Join existing game
    newSocket.emit("join-game", {
      gameId,
      userId: payload.id,
      username: payload.username || "Player",
    });

    newSocket.on("game-created", (data) => {
      console.log("[Ludo Frontend] Game created:", data);
      setRoom(data.room);
      setShareableLink(
        `${window.location.origin}/game/ludo/join/${data.gameId}`
      );
    });

    newSocket.on("game-joined", (data) => {
      console.log("[Ludo Frontend] Game joined:", data);
      setRoom(data.room);
      if (data.gameState) {
        setGameState(data.gameState);
      }
    });

    newSocket.on("player-joined", (data) => {
      setRoom(data.room);
      toast.success(`${data.player.username} joined!`);
    });

    newSocket.on("player-reconnected", (data) => {
      toast.info(`${data.player.username} reconnected`);
    });

    newSocket.on("game-started", (data) => {
      setGameState(data.gameState);
      toast.success("Game started!");
    });

    newSocket.on("dice-rolled", (data) => {
      setDiceResult(data.result);
      setValidMoves(data.validMoves);
      setHasRolled(true);

      if (data.playerId === payload.id) {
        if (data.validMoves.length === 0) {
          toast.info("No valid moves!");
        }
      }
    });

    newSocket.on("move-made", (data) => {
      setGameState(data.gameState);
      setDiceResult(null);
      setValidMoves([]);
      setSelectedToken(null);
      setHasRolled(false);

      if (data.captured) {
        toast.success("Token captured!");
      }
    });

    newSocket.on("turn-changed", (data) => {
      setIsMyTurn(data.currentPlayerId === payload.id);
      setDiceResult(null);
      setHasRolled(false);
    });

    newSocket.on("extra-turn", (data) => {
      if (data.playerId === payload.id) {
        toast.success("Rolled 6! Extra turn!");
        setHasRolled(false);
      }
    });

    newSocket.on("auto-move", (data) => {
      toast.info("Auto-move (timeout)");
    });

    newSocket.on("game-ended", (data) => {
      const isWinner = data.winners?.includes(payload.id);
      if (isWinner) {
        toast.success(`You won $${data.payout.toFixed(2)}!`);
      } else {
        toast.error("Game over!");
      }
      loadBalance();

      setTimeout(() => {
        router.push("/game/ludo");
      }, 5000);
    });

    newSocket.on("player-forfeited", (data) => {
      toast.warning("Player forfeited");
    });

    newSocket.on("error", (data) => {
      toast.error(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [gameId]);

  useEffect(() => {
    if (gameState) {
      setIsMyTurn(
        gameState.players[gameState.currentTurnIndex]?.userId === userId
      );
      drawBoard();
    }
  }, [gameState, selectedToken]);

  const loadBalance = async () => {
    try {
      const response = await walletAPI.getAll();
      const usdWallet = response.data.find((w: any) => w.currency === "USD");
      setBalance(usdWallet?.balance || 0);
    } catch (error) {
      console.error("Failed to load balance");
    }
  };

  const handleGameEnd = () => {
    loadBalance();
    router.push('/game/ludo');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <div className="text-xl">Loading game...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/game/ludo" className="text-2xl font-bold gradient-text">
            {" "}
            Ludo
          </Link>
          <div className="text-right">
            <div className="text-sm text-gray-400">Balance</div>
            <div className="text-xl font-bold text-primary">
              ${balance.toFixed(2)}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <LudoGame 
          gameId={gameId}
          userId={userId}
          username={username}
          onGameEnd={handleGameEnd}
        />
      </div>
    </div>
  );
}
