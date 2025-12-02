import { Server as SocketIOServer, Socket } from 'socket.io';
import { SessionManager } from '../services/SessionManager';

const sessionManager = new SessionManager();

let ioInstance: SocketIOServer | null = null;

export const broadcastSessionsUpdate = () => {
    if (ioInstance) {
        ioInstance.emit('sessions_updated');
    }
};

export const setupGameSocket = (io: SocketIOServer) => {
    ioInstance = io;

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Join a session room
        socket.on('join_session', ({ sessionId, playerId }) => {
            if (!sessionId || !playerId) {
                socket.emit('error', { message: 'Missing sessionId or playerId' });
                return;
            }

            socket.join(sessionId);
            console.log(`👤 Player ${playerId} joined session ${sessionId}`);

            // Notify other players in the session
            const player = sessionManager.getPlayer(playerId);
            if (player) {
                socket.to(sessionId).emit('player_joined', {
                    playerId: player.id,
                    username: player.username,
                });

                // Broadcast updated leaderboard to ALL players (including the joining player)
                const leaderboardData = sessionManager.getLeaderboard(sessionId);
                io.to(sessionId).emit('leaderboard_updated', leaderboardData);
            }
        });

        // Handle round completion
        socket.on('round_completed', ({ sessionId, playerId, roundData }) => {
            if (!sessionId || !playerId || !roundData) {
                socket.emit('error', { message: 'Missing required data' });
                return;
            }

            try {
                const result = sessionManager.submitRound(
                    playerId,
                    sessionId,
                    roundData.roundNumber,
                    roundData.targetColor,
                    roundData.selectedColor,
                    roundData.distance,
                    roundData.score
                );

                // Broadcast updated leaderboard to all players in the session
                const leaderboardData = sessionManager.getLeaderboard(sessionId);
                io.to(sessionId).emit('leaderboard_updated', leaderboardData);

                // If session is complete, notify all players
                if (result.isSessionComplete) {
                    io.to(sessionId).emit('session_complete', {
                        winner: leaderboardData.winner,
                    });
                }

                // Confirm to the submitting player
                socket.emit('round_submitted', result);
            } catch (error) {
                socket.emit('error', { message: (error as Error).message });
            }
        });

        // Handle chat messages
        socket.on('chat_message', ({ sessionId, playerId, username, message }) => {
            if (!sessionId || !playerId || !username || !message) {
                socket.emit('error', { message: 'Missing required data' });
                return;
            }

            try {
                const chatMessage = sessionManager.saveChatMessage(sessionId, playerId, username, message);
                // Broadcast to all players in the session
                io.to(sessionId).emit('chat_message', chatMessage);
            } catch (error) {
                socket.emit('error', { message: (error as Error).message });
            }
        });

        // Handle player quit
        socket.on('player_quit', ({ sessionId, playerId }) => {
            if (!sessionId || !playerId) {
                socket.emit('error', { message: 'Missing sessionId or playerId' });
                return;
            }

            try {
                // Remove player from database
                sessionManager.removePlayer(playerId);

                socket.leave(sessionId);

                // Broadcast updated leaderboard to remaining players
                const leaderboardData = sessionManager.getLeaderboard(sessionId);
                io.to(sessionId).emit('leaderboard_updated', leaderboardData);

                // Broadcast to room that player quit
                io.to(sessionId).emit('player_quit', { playerId });

                // Broadcast global update for live games list
                broadcastSessionsUpdate();
                console.log(`👋 Player ${playerId} quit session ${sessionId}`);
            } catch (error) {
                console.error('Error removing player:', error);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
}
