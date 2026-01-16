'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function JoinLudoPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  useEffect(() => {
    // Redirect to game room
    router.push(`/game/ludo/${gameId}`);
  }, [gameId, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <div className="text-xl">Joining game...</div>
      </div>
    </div>
  );
}
