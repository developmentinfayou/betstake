/**
 * Admin API Service
 * Centralized API client for all admin panel operations
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
    try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed?.state?.token || null;
        }
    } catch { }
    return null;
}

async function request<T = any>(path: string, options?: RequestInit): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        ...((options?.headers as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (options?.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(error.error || `Request failed: ${res.status}`);
    }

    return res.json();
}

// ─── Stats ────────────────────────────────────────────────────
export async function getStats() {
    return request('/api/admin/stats');
}

export async function getGameStats() {
    return request('/api/admin/stats/games');
}

export async function getRealtimeStats() {
    return request('/api/admin/stats/realtime');
}

export async function getTrends() {
    return request('/api/admin/stats/trends');
}

export async function getRevenue(period: string) {
    return request(`/api/admin/stats/revenue?period=${period}`);
}

// ─── Users ────────────────────────────────────────────────────
export async function getUsers(page: number, search: string) {
    return request(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
}

export async function getUserDetails(id: string) {
    return request(`/api/admin/users/${id}/details`);
}

export async function getUserBets(id: string, page: number, gameType?: string) {
    let url = `/api/admin/users/${id}/bets?page=${page}`;
    if (gameType) url += `&gameType=${gameType}`;
    return request(url);
}

export async function adjustBalance(id: string, data: { currency: string; amount: number; reason: string }) {
    return request(`/api/admin/users/${id}/balance`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function banUser(id: string, data: { banned: boolean; reason: string }) {
    return request(`/api/admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function updateUserRole(id: string, role: string) {
    return request(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
}

// ─── Games ────────────────────────────────────────────────────
export async function getGames() {
    return request('/api/admin/games');
}

export async function updateGame(gameType: string, data: any) {
    return request(`/api/admin/games/${gameType}`, { method: 'PUT', body: JSON.stringify(data) });
}

// ─── Jackpots ─────────────────────────────────────────────────
export async function getJackpots() {
    return request('/api/admin/jackpots');
}

export async function updateJackpot(id: string, data: any) {
    return request(`/api/admin/jackpots/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

// ─── Jackpot Conditions ──────────────────────────────────────
export async function getJackpotConditions() {
    return request('/api/admin/jackpot-conditions');
}

export async function getGameConditions(gameType: string) {
    return request(`/api/admin/jackpot-conditions/${gameType}`);
}

export async function updateGameConditions(gameType: string, data: any) {
    return request(`/api/admin/jackpot-conditions/${gameType}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function initializeJackpotConditions() {
    return request('/api/admin/jackpot-conditions/initialize', { method: 'POST' });
}

export async function triggerJackpot(gameType: string, data: { userId: string; amount: number; reason: string }) {
    return request(`/api/admin/jackpot-conditions/${gameType}/trigger`, { method: 'POST', body: JSON.stringify(data) });
}

// ─── Rakeback ─────────────────────────────────────────────────
export async function getRakebackConfig(currency: string) {
    return request(`/api/admin/rakeback/config/${currency}`);
}

export async function updateRakebackConfig(currency: string, data: any) {
    return request(`/api/admin/rakeback/config/${currency}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function getRakebackStats() {
    return request('/api/admin/rakeback/stats');
}

export async function getPendingClaims(currency: string) {
    return request(`/api/admin/rakeback/pending?currency=${currency}`);
}

export async function approveClaim(id: string) {
    return request(`/api/admin/rakeback/${id}/approve`, { method: 'POST' });
}

// ─── Challenges ───────────────────────────────────────────────
export async function getChallenges(page = 1, limit = 20) {
    return request(`/api/admin/challenges?page=${page}&limit=${limit}`);
}

export async function getChallengeStats() {
    return request('/api/admin/challenges/stats/overview');
}

export async function createChallenge(data: any) {
    return request('/api/admin/challenges', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateChallenge(id: string, data: any) {
    return request(`/api/admin/challenges/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteChallenge(id: string) {
    return request(`/api/admin/challenges/${id}`, { method: 'DELETE' });
}

export async function activateChallenge(id: string) {
    return request(`/api/admin/challenges/${id}/activate`, { method: 'POST' });
}

export async function cancelChallenge(id: string, reason: string) {
    return request(`/api/admin/challenges/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });
}

// ─── Contests ─────────────────────────────────────────────────
export async function getContests() {
    return request('/api/admin/contests');
}

export async function createContest(data: any) {
    return request('/api/admin/contests', { method: 'POST', body: JSON.stringify(data) });
}

// ─── Activity Logs ────────────────────────────────────────────
export async function getActivityLogs(limit = 50) {
    return request(`/api/admin/logs?limit=${limit}`);
}

export async function getLogStats(days = 7) {
    return request(`/api/admin/logs/stats?days=${days}`);
}

// ─── Reports ──────────────────────────────────────────────────
export async function getRevenueReport(startDate: string, endDate: string) {
    return request(`/api/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`);
}

export async function getPnlByGame(startDate: string, endDate: string) {
    return request(`/api/admin/reports/pnl-by-game?startDate=${startDate}&endDate=${endDate}`);
}

export async function exportReport(type: string, startDate: string, endDate: string) {
    const token = getToken();
    const res = await fetch(
        `${API_URL}/api/admin/reports/export?type=${type}&startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
}

// ─── Platform Settings ───────────────────────────────────────
export async function getPlatformSettings() {
    return request('/api/admin/settings');
}

export async function updatePlatformSettings(data: any) {
    return request('/api/admin/settings', { method: 'PUT', body: JSON.stringify(data) });
}

export async function resetPlatformSettings() {
    return request('/api/admin/settings/reset', { method: 'POST' });
}

export async function toggleMaintenance(enabled: boolean, message?: string) {
    return request('/api/admin/settings/maintenance', { method: 'POST', body: JSON.stringify({ enabled, message }) });
}

// ─── Game Settings (NEW) ─────────────────────────────────────
export async function getGameSettings() {
    return request('/api/admin/game-settings');
}

export async function updateGameSettings(data: any) {
    return request('/api/admin/game-settings', { method: 'PUT', body: JSON.stringify(data) });
}

// ─── Game Info (NEW) ──────────────────────────────────────────
export async function getGameInfoList() {
    return request('/api/admin/game-info');
}

export async function getGameInfo(gameType: string) {
    return request(`/api/admin/game-info/${gameType}`);
}

export async function updateGameInfo(gameType: string, data: any) {
    return request(`/api/admin/game-info/${gameType}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function initializeGameInfo() {
    return request('/api/admin/game-info/initialize', { method: 'POST' });
}

// ─── Win Categories (NEW) ────────────────────────────────────
export async function getWinCategories() {
    return request('/api/admin/win-categories');
}

export async function updateWinCategories(data: any) {
    return request('/api/admin/win-categories', { method: 'PUT', body: JSON.stringify(data) });
}
