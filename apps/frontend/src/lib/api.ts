import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  getAll: () => api.get('/strategy/all'),
  getDefaults: () => api.get('/strategy/defaults'),
  getById: (id: string) => api.get(`/strategy/${id}`),
  create: (data: { name: string; conditions: any[]; isPublic?: boolean }) => api.post('/strategy', data),
  update: (id: string, data: { name: string; conditions: any[] }) => api.put(`/strategy/${id}`, data),
  delete: (id: string) => api.delete(`/strategy/${id}`),
  getCommunity: () => api.get('/strategy/community'),
  toggleVisibility: (id: string) => api.put(`/strategy/${id}/visibility`),
  useStrategy: (id: string) => api.post(`/strategy/${id}/use`),
  getDiamondBalance: () => api.get('/strategy/diamonds/balance'),
  getDiamondHistory: () => api.get('/strategy/diamonds/history'),
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
  getActiveSession: () =>
    api.get('/mines/active-session'),
};

// CoinFlip API (session-based)
export const coinflipAPI = {
  start: (data: { betAmount: number; currency: string }) =>
    api.post('/coinflip/start', data),
  pick: (data: { sessionId: string; choice: 'heads' | 'tails' }) =>
    api.post('/coinflip/pick', data),
  cashout: (data: { sessionId: string }) =>
    api.post('/coinflip/cashout', data),
  getActiveSession: () =>
    api.get('/coinflip/active-session'),
  cleanup: () =>
    api.post('/coinflip/cleanup'),
};

// Tower API
export const towerAPI = {
  start: (data: { difficulty: string; betAmount: number; currency: string }) =>
    api.post('/tower/start', data),
  reveal: (data: { sessionId: string; tileIndex: number }) =>
    api.post('/tower/reveal', data),
  cashout: (data: { sessionId: string }) =>
    api.post('/tower/cashout', data),
  getConfig: () =>
    api.get('/tower/config'),
  getMultipliers: (difficulty: string) =>
    api.get(`/tower/multipliers/${difficulty}`),
  getActiveSession: () =>
    api.get('/tower/active-session'),
};

// Stairs API
export const stairsAPI = {
  start: (data: { steps: number; betAmount: number; currency: string }) =>
    api.post('/stairs/start', data),
  reveal: (data: { sessionId: string; tileIndex: number }) =>
    api.post('/stairs/reveal', data),
  cashout: (data: { sessionId: string }) =>
    api.post('/stairs/cashout', data),
  getActiveSession: () =>
    api.get('/stairs/active-session'),
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
  getActiveSession: () =>
    api.get('/hilo/active-session'),
  clearSession: () =>
    api.delete('/hilo/session'),
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
  split: (data: { sessionId: string }) =>
    api.post('/blackjack/split', data),
  getActiveSession: () =>
    api.get('/blackjack/active-session'),
};



// Active Sessions API (cross-game)
export const activeSessionsAPI = {
  check: () => api.get('/active-sessions'),
};

// Rush API
export const rushAPI = {
  start: (data: { difficulty: string; betAmount: number; currency: string }) =>
    api.post('/rush/start', data),
  next: (data: { sessionId: string }) =>
    api.post('/rush/next', data),
  cashout: (data: { sessionId: string }) =>
    api.post('/rush/cashout', data),
  getActiveSession: () =>
    api.get('/rush/active-session'),
  clearSession: () =>
    api.delete('/rush/session'),
};

// Balloon / Pump API (session-based)
export const balloonAPI = {
  start: (data: { difficulty: string; betAmount: number; currency: string }) =>
    api.post('/balloon/start', data),
  pump: (data: { sessionId: string }) =>
    api.post('/balloon/pump', data),
  cashout: (data: { sessionId: string }) =>
    api.post('/balloon/cashout', data),
  auto: (data: { difficulty: string; betAmount: number; currency: string; targetPumps: number }) =>
    api.post('/balloon/auto', data),
  getActiveSession: () =>
    api.get('/balloon/active-session'),
  clearSession: () =>
    api.delete('/balloon/session'),
  getSteps: (difficulty: string) =>
    api.get(`/balloon/steps/${difficulty}`),
};

// Verification API (client-side only, no auth needed)
export const verifyAPI = {
  calculateResult: (serverSeed: string, clientSeed: string, nonce: number, gameType: string) => {
    // This will be implemented client-side using crypto
    return { serverSeed, clientSeed, nonce, gameType };
  },
};


