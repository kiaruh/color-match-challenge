import { Router, Request, Response } from 'express';
import { SessionManager } from '../services/SessionManager';

const router = Router();
const sessionManager = new SessionManager();

// Create a new session
router.post('/sessions', (req: Request, res: Response) => {
    try {
        const { startColor, endColor } = req.body;
        const session = sessionManager.createSession(startColor, endColor);
        res.json(session);
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

        res.json(session);
    } catch (error) {
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

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Join a session
router.post('/sessions/:sessionId/join', (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const player = sessionManager.joinSession(sessionId);

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

export default router;
