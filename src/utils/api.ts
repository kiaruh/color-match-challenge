// API client for Color Match Challenge backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Session {
    id: string;
    startColor: string;
    endColor: string;
    createdAt: string;
    status: 'active' | 'completed';
    maxPlayers?: number;
    password?: string;
    totalRounds?: number;
    currentTurnPlayerId?: string | null;
    turnEndTime?: string | null;
}

export interface ActiveSession extends Session {
    playerCount: number;
    hasPassword: boolean;
}

export interface Player {
    id: string;
    sessionId: string;
    username: string;
    joinedAt: string;
    completedRounds: number;
    bestScore: number;
    status: 'active' | 'finished';
}

export interface JoinSessionResponse {
    playerId: string;
    username: string;
    sessionId: string;
    currentRound: number;
    completedRounds: number;
}

export interface SubmitRoundResponse {
    roundId: string;
    bestScore: number;
    completedRounds: number;
    isSessionComplete: boolean;
}

export interface LeaderboardEntry {
    playerId: string;
    username: string;
    bestScore: number;
    totalScore: number;
    completedRounds: number;
    isFinished: boolean;
    isWaiting: boolean;
}

export interface LeaderboardResponse {
    leaderboard: LeaderboardEntry[];
    winner: LeaderboardEntry | null;
}

export interface ChatMessage {
    id: string;
    sessionId: string;
    playerId: string;
    username: string;
    message: string;
    timestamp: string;
}

/**
 * Create a new game session
 */
export async function createSession(
    startColor?: string,
    endColor?: string,
    password?: string,
    maxPlayers: number = 4,
    totalRounds: number = 3
): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startColor, endColor, password, maxPlayers, totalRounds }),
    });

    if (!response.ok) {
        throw new Error('Failed to create session');
    }

    return response.json();
}

/**
 * Get session details by ID
 */
export async function getSession(sessionId: string): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch session');
    }

    return response.json();
}

/**
 * Get the most recent active session
 */
export async function getMostRecentActiveSession(): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/sessions-active/latest`);

    if (!response.ok) {
        throw new Error('No active session found');
    }

    return response.json();
}

/**
 * Get all active sessions
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
    const response = await fetch(`${API_BASE_URL}/sessions/active`);

    if (!response.ok) {
        throw new Error('Failed to fetch active sessions');
    }

    return response.json();
}

/**
 * Join an existing session
 */
export async function joinSession(sessionId: string, username: string, password?: string): Promise<JoinSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error('Failed to join session');
    }

    return response.json();
}

/**
 * Submit a completed round
 */
export async function submitRound(
    sessionId: string,
    playerId: string,
    roundNumber: number,
    targetColor: string,
    selectedColor: string,
    distance: number,
    score: number
): Promise<SubmitRoundResponse> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/rounds`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            playerId,
            roundNumber,
            targetColor,
            selectedColor,
            distance,
            score,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to submit round');
    }

    return response.json();
}

/**
 * Get chat history for a session
 */
export async function getChatHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/chat?limit=${limit}`);

    if (!response.ok) {
        throw new Error('Failed to fetch chat history');
    }

    return response.json();
}

/**
 * Send a chat message
 */
export async function sendChatMessage(sessionId: string, playerId: string, username: string, message: string): Promise<ChatMessage> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId, username, message }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    return response.json();
}

/**
 * Get leaderboard for a session
 */
export async function getLeaderboard(sessionId: string): Promise<LeaderboardResponse> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/leaderboard`);

    if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
    }

    return response.json();
}

/**
 * Get global rankings
 */
export async function getGlobalRankings(limit: number = 10): Promise<Array<{ name: string; country: string; score: number; timestamp: string }>> {
    const response = await fetch(`${API_BASE_URL}/rankings/global?limit=${limit}`);

    if (!response.ok) {
        throw new Error('Failed to fetch global rankings');
    }

    return response.json();
}

/**
 * Get country-specific rankings
 */
export async function getCountryRankings(country: string, limit: number = 10): Promise<Array<{ name: string; country: string; score: number; timestamp: string }>> {
    const response = await fetch(`${API_BASE_URL}/rankings/country/${country}?limit=${limit}`);

    if (!response.ok) {
        throw new Error('Failed to fetch country rankings');
    }

    return response.json();
}
