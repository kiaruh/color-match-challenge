import { Router, Request, Response } from 'express';
import { SessionManager } from '../services/SessionManager';
import { broadcastSessionsUpdate } from '../sockets/gameSocket';

const router = Router();
const sessionManager = new SessionManager();

// Create a new session
router.post('/sessions', (req: Request, res: Response) => {
    try {
        const { startColor, endColor, password, maxPlayers, totalRounds } = req.body;
        console.log('📝 Creating session with:', { startColor, endColor, password: !!password, maxPlayers, totalRounds });
        const session = sessionManager.createSession(startColor, endColor, password, maxPlayers, totalRounds);
        console.log('✅ Session created:', session.id);

        // Broadcast update
        broadcastSessionsUpdate();

        // Don't send password back to client
        const { password: _, ...sessionWithoutPassword } = session;
        res.json(sessionWithoutPassword);
    } catch (error) {
        console.error('❌ Error creating session:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get most recent active session
router.get('/sessions-active/latest', (req: Request, res: Response) => {
    try {
        const session = sessionManager.getMostRecentActiveSession();

        if (!session) {
            return res.status(404).json({ error: 'No active session found' });
        }

        // Don't send password to client
        const { password: _, ...sessionWithoutPassword } = session;
        res.json(sessionWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get all active sessions
router.get('/sessions/active', (req: Request, res: Response) => {
    try {
        const sessions = sessionManager.getActiveSessions();

        // Don't send passwords to client
        const sanitizedSessions = sessions.map(session => {
            const { password, ...rest } = session;
            return {
                ...rest,
                hasPassword: !!password
            };
        });

        res.json(sanitizedSessions);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get session details
router.get('/sessions/:sessionId', (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const session = sessionManager.getSession(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Don't send password to client
        const { password: _, ...sessionWithoutPassword } = session;
        res.json(sessionWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Join a session
router.post('/sessions/:sessionId/join', (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { username, password } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const player = sessionManager.joinSession(sessionId, username, password);

        // Broadcast update
        broadcastSessionsUpdate();

        res.json({
            playerId: player.id,
            username: player.username,
            sessionId: player.sessionId,
            currentRound: 1,
            completedRounds: player.completedRounds,
        });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Submit a round
router.post('/sessions/:sessionId/rounds', (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { playerId, roundNumber, targetColor, selectedColor, distance, score } = req.body;

        if (!playerId || roundNumber === undefined || !targetColor || !selectedColor || distance === undefined || score === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = sessionManager.submitRound(
            playerId,
            sessionId,
            roundNumber,
            targetColor,
            selectedColor,
            distance,
            score
        );

        res.json(result);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Get leaderboard
router.get('/sessions/:sessionId/leaderboard', (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const leaderboard = sessionManager.getLeaderboard(sessionId);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get chat history
router.get('/sessions/:sessionId/chat', (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const messages = sessionManager.getChatHistory(sessionId, limit);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Send chat message
router.post('/sessions/:sessionId/chat', (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { playerId, username, message } = req.body;

        if (!playerId || !username || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const chatMessage = sessionManager.saveChatMessage(sessionId, playerId, username, message);
        res.json(chatMessage);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Get global rankings
router.get('/rankings/global', (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const rankings = sessionManager.getGlobalRankings(limit);
        res.json(rankings);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get country-specific rankings
router.get('/rankings/country/:country', (req: Request, res: Response) => {
    try {
        const { country } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const rankings = sessionManager.getCountryRankings(country, limit);
        res.json(rankings);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Save solo game result
router.post('/solo-games', (req: Request, res: Response) => {
    try {
        const { username, totalScore, completedRounds, country, ip } = req.body;

        if (!username || totalScore === undefined || completedRounds === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const gameId = sessionManager.saveSoloGame(username, totalScore, completedRounds, country, ip);
        res.json({ gameId, success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get solo game rankings
router.get('/solo-games/rankings', (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const rankings = sessionManager.getSoloRankings(limit);
        res.json(rankings);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get player's solo rank
router.get('/solo-games/rank/:username/:score', (req: Request, res: Response) => {
    try {
        const { username, score } = req.params;
        const totalScore = parseInt(score);
        const rank = sessionManager.getPlayerSoloRank(username, totalScore);
        res.json(rank);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
