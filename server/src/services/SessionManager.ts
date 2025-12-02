import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { Session, Player, Round, LeaderboardEntry, AnalyticsEvent, ChatMessage } from '../types';

export class SessionManager {
    // Generate random color
    private generateRandomColor(): string {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Create a new session
    createSession(startColor?: string, endColor?: string, password?: string, maxPlayers: number = 4): Session {
        const session: Session = {
            id: uuidv4(),
            startColor: startColor || this.generateRandomColor(),
            endColor: endColor || this.generateRandomColor(),
            createdAt: new Date().toISOString(),
            status: 'active',
            maxPlayers,
            password,
        };

        const stmt = db.prepare(`
      INSERT INTO sessions (id, startColor, endColor, createdAt, status, maxPlayers, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(session.id, session.startColor, session.endColor, session.createdAt, session.status, session.maxPlayers, session.password);

        return session;
    }

    // Get session by ID
    getSession(sessionId: string): Session | null {
        const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
        return stmt.get(sessionId) as Session | null;
    }

    // Get most recent active session
    getMostRecentActiveSession(): Session | null {
        const stmt = db.prepare(`
      SELECT * FROM sessions 
      WHERE status = 'active' 
      ORDER BY createdAt DESC 
      LIMIT 1
    `);
        return stmt.get() as Session | null;
    }

    // Get all active sessions with player counts
    getActiveSessions(): Array<Session & { playerCount: number }> {
        const stmt = db.prepare(`
            SELECT s.*, COUNT(p.id) as playerCount
            FROM sessions s
            LEFT JOIN players p ON s.id = p.sessionId
            WHERE s.status = 'active'
            GROUP BY s.id
            ORDER BY s.createdAt DESC
        `);
        return stmt.all() as Array<Session & { playerCount: number }>;
    }

    // Join a session (create player)
    joinSession(sessionId: string, username: string, password?: string): Player {
        const session = this.getSession(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        if (session.status !== 'active') {
            throw new Error('Session is not active');
        }

        // Validate password if session is password-protected
        if (session.password && session.password !== password) {
            throw new Error('Incorrect password');
        }

        // Check max players
        const playerCount = this.getPlayerCount(sessionId);
        const maxPlayers = session.maxPlayers || 4;
        if (playerCount >= maxPlayers) {
            throw new Error(`Session is full (max ${maxPlayers} players)`);
        }

        const player: Player = {
            id: uuidv4(),
            sessionId,
            username,
            joinedAt: new Date().toISOString(),
            completedRounds: 0,
            bestScore: 0,
            status: 'active',
        };

        const stmt = db.prepare(`
      INSERT INTO players (id, sessionId, username, joinedAt, completedRounds, bestScore, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(
            player.id,
            player.sessionId,
            player.username,
            player.joinedAt,
            player.completedRounds,
            player.bestScore,
            player.status
        );

        // Track analytics
        this.trackEvent(sessionId, player.id, 'session_join', { username: player.username });

        return player;
    }

    // Get player by ID
    getPlayer(playerId: string): Player | null {
        const stmt = db.prepare('SELECT * FROM players WHERE id = ?');
        return stmt.get(playerId) as Player | null;
    }

    // Get player count for session
    getPlayerCount(sessionId: string): number {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM players WHERE sessionId = ?');
        const result = stmt.get(sessionId) as { count: number };
        return result.count;
    }

    // Submit a round
    submitRound(
        playerId: string,
        sessionId: string,
        roundNumber: number,
        targetColor: string,
        selectedColor: string,
        distance: number,
        score: number
    ): { roundId: string; bestScore: number; completedRounds: number; isSessionComplete: boolean } {
        const player = this.getPlayer(playerId);
        if (!player) {
            throw new Error('Player not found');
        }

        if (player.completedRounds >= 3) {
            throw new Error('Player has already completed all rounds');
        }

        // Create round
        const round: Round = {
            id: uuidv4(),
            playerId,
            sessionId,
            roundNumber,
            targetColor,
            selectedColor,
            distance,
            score,
            timestamp: new Date().toISOString(),
        };

        const roundStmt = db.prepare(`
      INSERT INTO rounds (id, playerId, sessionId, roundNumber, targetColor, selectedColor, distance, score, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        roundStmt.run(
            round.id,
            round.playerId,
            round.sessionId,
            round.roundNumber,
            round.targetColor,
            round.selectedColor,
            round.distance,
            round.score,
            round.timestamp
        );

        // Update player stats
        const newCompletedRounds = player.completedRounds + 1;
        const newBestScore = Math.max(player.bestScore, score);
        const newStatus = newCompletedRounds >= 3 ? 'finished' : 'active';

        const updateStmt = db.prepare(`
      UPDATE players 
      SET completedRounds = ?, bestScore = ?, status = ?
      WHERE id = ?
    `);
        updateStmt.run(newCompletedRounds, newBestScore, newStatus, playerId);

        // Track analytics
        this.trackEvent(sessionId, playerId, 'round_complete', {
            roundNumber,
            score,
            distance,
        });

        // Check if session is complete (all players finished)
        const isSessionComplete = this.checkSessionComplete(sessionId);

        return {
            roundId: round.id,
            bestScore: newBestScore,
            completedRounds: newCompletedRounds,
            isSessionComplete,
        };
    }

    // Check if all players in session have finished
    private checkSessionComplete(sessionId: string): boolean {
        const stmt = db.prepare(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN status = 'finished' THEN 1 ELSE 0 END) as finished
      FROM players
      WHERE sessionId = ?
    `);
        const result = stmt.get(sessionId) as { total: number; finished: number };

        // Session is complete if there's at least one player and all are finished
        return result.total > 0 && result.total === result.finished;
    }

    // Get leaderboard for session
    getLeaderboard(sessionId: string): { leaderboard: LeaderboardEntry[]; winner: LeaderboardEntry | null } {
        const stmt = db.prepare(`
      SELECT id as playerId, username, bestScore, completedRounds, status
      FROM players
      WHERE sessionId = ?
      ORDER BY bestScore DESC, completedRounds DESC
    `);
        const players = stmt.all(sessionId) as Array<Player & { playerId: string }>;

        const leaderboard: LeaderboardEntry[] = players.map((p) => ({
            playerId: p.playerId,
            username: p.username,
            bestScore: p.bestScore,
            completedRounds: p.completedRounds,
            isFinished: p.status === 'finished',
        }));

        // Determine winner (highest score among finished players)
        const finishedPlayers = leaderboard.filter((p) => p.isFinished);
        const winner = finishedPlayers.length > 0 ? finishedPlayers[0] : null;

        return { leaderboard, winner };
    }

    // Track analytics event
    private trackEvent(sessionId: string, playerId: string, eventType: AnalyticsEvent['eventType'], data: any) {
        const event: AnalyticsEvent = {
            id: uuidv4(),
            sessionId,
            playerId,
            eventType,
            data: JSON.stringify(data),
            timestamp: new Date().toISOString(),
        };

        const stmt = db.prepare(`
      INSERT INTO analytics_events (id, sessionId, playerId, eventType, data, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(event.id, event.sessionId, event.playerId, event.eventType, event.data, event.timestamp);
    }

    // Get all players in a session
    getSessionPlayers(sessionId: string): Player[] {
        const stmt = db.prepare('SELECT * FROM players WHERE sessionId = ? ORDER BY joinedAt ASC');
        return stmt.all(sessionId) as Player[];
    }

    // Save chat message
    saveChatMessage(sessionId: string, playerId: string, username: string, message: string): ChatMessage {
        const chatMessage: ChatMessage = {
            id: uuidv4(),
            sessionId,
            playerId,
            username,
            message,
            timestamp: new Date().toISOString(),
        };

        const stmt = db.prepare(`
      INSERT INTO chat_messages (id, sessionId, playerId, username, message, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(chatMessage.id, chatMessage.sessionId, chatMessage.playerId, chatMessage.username, chatMessage.message, chatMessage.timestamp);

        return chatMessage;
    }

    // Get chat history for a session
    getChatHistory(sessionId: string, limit: number = 50): ChatMessage[] {
        const stmt = db.prepare(`
      SELECT * FROM chat_messages
      WHERE sessionId = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
        const messages = stmt.all(sessionId, limit) as ChatMessage[];
        return messages.reverse(); // Return in chronological order
    }
}
