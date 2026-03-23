import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function JoinRPSPage() {
    const params = useParams();
    const navigate = useNavigate();
    const gameId = params.gameId as string;

    useEffect(() => {
        // Redirect to game page — joining logic happens in the game component
        navigate(`/game/rps/${gameId}`, { replace: true });
    }, [gameId, navigate]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <div className="text-xl">Joining game...</div>
            </div>
        </div>
    );
}
