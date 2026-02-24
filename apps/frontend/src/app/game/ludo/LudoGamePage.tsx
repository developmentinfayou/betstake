import { useState, useEffect } from "react";
import { walletAPI } from "@/lib/api";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LudoGame from "@/components/LudoGameNew";

export default function LudoGamePage() {
    const params = useParams();
    const navigate = useNavigate();
    const gameId = params.gameId as string;

    const [balance, setBalance] = useState(0);
    const [userId, setUserId] = useState("");
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBalance();
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.id);
        setUsername(payload.username || "Player");
        setIsLoading(false);
    }, []);

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
        navigate("/game/ludo");
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
                    <Link to="/game/ludo" className="text-2xl font-bold gradient-text">
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
