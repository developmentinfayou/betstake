import axios from 'axios';
import { createHmac, createHash } from 'crypto';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Bet API
export const betAPI = {
  place: (data: any) => api.post('/bet/place', data),
  history: (limit?: number, offset?: number) =>
    api.get('/bet/history', { params: { limit, offset } }),
  getHistory: (limit?: number, offset?: number) =>
    api.get('/bet/history', { params: { limit, offset } }),
  getById: (betId: string) => api.get(`/bet/${betId}`),
  verify: (betId: string) => api.post('/bet/verify', { betId }),
  startAutobet: (data: any) => api.post('/bet/autobet/start', data),
  stopAutobet: () => api.post('/bet/autobet/stop'),
  autobetStatus: () => api.get('/bet/autobet/status'),
  verifyBet: (betId: string) => api.get(`/bet/${betId}`),
};

// Wallet API
export const walletAPI = {
  getAll: () => api.get('/wallet'),
  get: (currency: string) => api.get(`/wallet/${currency}`),
  addBalance: (currency: string, amount: number) =>
    api.post('/wallet/add', { currency, amount }),
};

// Seed API
export const seedAPI = {
  getActive: () => api.get('/seed/active'),
  updateClientSeed: (clientSeed: string) =>
    api.post('/seed/client-seed', { clientSeed }),
  rotate: () => api.post('/seed/rotate'),
  verify: (seedPairId: string) => api.get(`/seed/verify/${seedPairId}`),
  getBetCount: () => api.get('/seed/bet-count'),
  getHistory: () => api.get('/seed/history'),
  unhash: (serverSeed: string) => api.post('/seed/unhash', { serverSeed }),
};

// Game API
export const gameAPI = {
  getAll: () => api.get('/game'),
  get: (gameType: string) => api.get(`/game/${gameType}`),
  toggleFavorite: (gameType: string) =>
    api.post(`/game/${gameType}/favorite`),
  getFavorites: () => api.get('/game/favorites/list'),
};

// Strategy API
export const strategyAPI = {
  getDefaults: () => api.get('/strategy/defaults'),
  create: (data: any) => api.post('/strategy', data),
  getMy: () => api.get('/strategy/my'),
  getPublic: (gameType?: string, limit?: number) =>
    api.get('/strategy/public', { params: { gameType, limit } }),
  publish: (strategyId: string, commission: number) =>
    api.post(`/strategy/${strategyId}/publish`, { commission }),
};

// Contest API
export const contestAPI = {
  getActive: () => api.get('/contest/active'),
  getLeaderboard: (contestId: string) =>
    api.get(`/contest/${contestId}/leaderboard`),
  getMyEntry: (contestId: string) =>
    api.get(`/contest/${contestId}/my-entry`),
};

// Jackpot API
export const jackpotAPI = {
  getAll: () => api.get('/jackpot'),
  getWinners: (limit?: number) =>
    api.get('/jackpot/winners', { params: { limit } }),
};

// Leaderboard API
export const leaderboardAPI = {
  allBets: (limit?: number, offset?: number) =>
    api.get('/leaderboard/all-bets', { params: { limit, offset } }),
  highRollers: (currency: string, limit?: number) =>
    api.get('/leaderboard/high-rollers', { params: { currency, limit } }),
  bigWins: (currency: string, limit?: number) =>
    api.get('/leaderboard/big-wins', { params: { currency, limit } }),
  luckyWins: (limit?: number) =>
    api.get('/leaderboard/lucky-wins', { params: { limit } }),
};

// Mines API
export const minesAPI = {
  start: (data: { minesCount: number; betAmount: number; currency: string; gridSize: number }) =>
    api.post('/mines/start', data),
  reveal: (data: { sessionId: string; tileIndex: number }) =>
    api.post('/mines/reveal', data),
  randomReveal: (data: { sessionId: string }) =>
    api.post('/mines/random-reveal', data),
  cashout: (data: { sessionId: string }) =>
    api.post('/mines/cashout', data),
  cleanup: () =>
    api.post('/mines/cleanup'),
};

// Tower API
export const towerAPI = {
  start: (data: { floors: number; betAmount: number; currency: string }) =>
    api.post('/tower/start', data),
  reveal: (data: { sessionId: string; tileIndex: number }) =>
    api.post('/tower/reveal', data),
  cashout: (data: { sessionId: string }) =>
    api.post('/tower/cashout', data),
};

// Stairs API
export const stairsAPI = {
  start: (data: { steps: number; betAmount: number; currency: string }) =>
    api.post('/stairs/start', data),
  reveal: (data: { sessionId: string; tileIndex: number }) =>
    api.post('/stairs/reveal', data),
  cashout: (data: { sessionId: string }) =>
    api.post('/stairs/cashout', data),
};

// HiLo API
export const hiloAPI = {
  start: (data: { betAmount: number; currency: string }) =>
    api.post('/hilo/start', data),
  predict: (data: { sessionId: string; choice: 'higher' | 'lower' | 'skip' }) =>
    api.post('/hilo/predict', data),
  cashout: (data: { sessionId: string }) =>
    api.post('/hilo/cashout', data),
  probabilities: (currentCard: number, cardHistory: number[] = []) =>
    api.get(`/hilo/probabilities/${currentCard}`, { 
      params: { cardHistory: JSON.stringify(cardHistory) } 
    }),
};

// Blackjack API
export const blackjackAPI = {
  start: (data: { betAmount: number; currency: string }) =>
    api.post('/blackjack/start', data),
  hit: (data: { sessionId: string }) =>
    api.post('/blackjack/hit', data),
  stand: (data: { sessionId: string }) =>
    api.post('/blackjack/stand', data),
  double: (data: { sessionId: string }) =>
    api.post('/blackjack/double', data),
};

// Verification API (client-side only, no auth needed)
export const verifyAPI = {
  calculateResult: (serverSeed: string, clientSeed: string, nonce: number, gameType: string) => {
    // This will be implemented client-side using crypto
    return { serverSeed, clientSeed, nonce, gameType };
  },
};
