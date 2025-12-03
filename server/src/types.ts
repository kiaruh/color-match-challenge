export interface Session {
    id: string;
    startColor: string;
    endColor: string;
    createdAt: string;
    status: 'active' | 'completed';
    maxPlayers?: number;
    password?: string;
    currentRound: number;
    totalRounds?: number;
    currentTurnPlayerId?: string | null;
    turnEndTime?: string | null;
}

export interface Player {
    id: string;
    sessionId: string;
    username: string;
    joinedAt: string;
    completedRounds: number;
    bestScore: number;
    totalScore: number;
    status: 'active' | 'finished';
    isWaiting: number; // 0 or 1 (SQLite boolean)
    country?: string;
    ip?: string;
}

export interface Round {
    id: string;
    playerId: string;
    sessionId: string;
    roundNumber: number;
    targetColor: string;
    selectedColor: string;
    distance: number;
    score: number;
    timestamp: string;
}

export interface ChatMessage {
    id: string;
    sessionId: string;
    playerId: string;
    username: string;
    message: string;
    timestamp: string;
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

export interface AnalyticsEvent {
    id: string;
    sessionId: string;
    playerId: string;
    eventType: 'round_complete' | 'session_join' | 'session_complete';
    data: string; // JSON stringified
    timestamp: string;
}
