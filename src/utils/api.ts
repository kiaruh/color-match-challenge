// API client for Color Match Challenge backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Session {
    id: string;
    startColor: string;
    endColor: string;
    createdAt: string;
    status: 'active' | 'completed';
    maxPlayers?: number;
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
    completedRounds: number;
    isFinished: boolean;
}

export interface LeaderboardResponse {
    leaderboard: LeaderboardEntry[];
    winner: LeaderboardEntry | null;
}

/**
 * Create a new game session
 */
export async function createSession(
    startColor?: string,
    endColor?: string
): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startColor, endColor }),
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
 * Join an existing session
 */
export async function joinSession(sessionId: string): Promise<JoinSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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
 * Get leaderboard for a session
 */
export async function getLeaderboard(sessionId: string): Promise<LeaderboardResponse> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/leaderboard`);

    if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
    }

    return response.json();
}
