export enum RPSChoice {
    ROCK = 'ROCK',
    PAPER = 'PAPER',
    SCISSORS = 'SCISSORS'
}

export enum RPSMode {
    BO1 = 'bo1',
    BO3 = 'bo3',
    BO5 = 'bo5'
}

export interface RPSRound {
    roundNumber: number;
    player1Choice: RPSChoice | null;
    player2Choice: RPSChoice | null;
    winner: string | null; // playerId or 'draw'
}

export interface RPSGameState {
    players: Array<{ userId: string; username: string }>;
    rounds: RPSRound[];
    currentRound: number;
    scores: Record<string, number>; // userId → wins
    mode: RPSMode;
    winner: string | null;
    serverSeed: string;
    serverSeedHash: string;
    clientSeeds: Record<string, string>;
    nonce: number;
}
