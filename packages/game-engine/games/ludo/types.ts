export enum LudoColor {
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  YELLOW = 'YELLOW'
}

export enum LudoMode {
  ONE_V_ONE = '1v1',
  TWO_V_TWO = '2v2',
  FOUR_PLAYER = '1v1v1v1'
}

export interface LudoToken {
  id: number; // 0-3
  position: number; // -1 = home, 0-56 = path, 57 = finished
  isFinished: boolean;
}

export interface LudoPlayer {
  userId: string;
  username: string;
  color: LudoColor;
  tokens: LudoToken[];
  teamId?: number; // For 2v2 mode
  isActive: boolean;
}

export interface LudoGameState {
  players: LudoPlayer[];
  currentTurnIndex: number;
  diceResult: number | null;
  moveHistory: LudoMove[];
  serverSeed: string;
  serverSeedHash: string;
  clientSeeds: Record<string, string>;
  nonce: number;
  winner?: string;
  winningTeam?: number;
}

export interface LudoMove {
  playerId: string;
  tokenId: number;
  from: number;
  to: number;
  diceRoll: number;
  nonce: number;
  captured?: { playerId: string; tokenId: number };
  timestamp: number;
}

export interface ValidMove {
  tokenId: number;
  from: number;
  to: number;
  canCapture: boolean;
}
