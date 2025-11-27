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

export interface LeaderboardEntry {
    playerId: string;
    username: string;
    bestScore: number;
    completedRounds: number;
    isFinished: boolean;
}

export interface AnalyticsEvent {
    id: string;
    sessionId: string;
    playerId: string;
    eventType: 'round_complete' | 'session_join' | 'session_complete';
    data: string; // JSON stringified
    timestamp: string;
}
