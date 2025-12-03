import { Server as SocketIOServer, Socket } from 'socket.io';
import { SessionManager } from '../services/SessionManager';

const sessionManager = new SessionManager();

let ioInstance: SocketIOServer | null = null;

// Map to track socket -> { sessionId, playerId }
const socketPlayerMap = new Map<string, { sessionId: string; playerId: string }>();

// Map to track session -> Set<playerId> for new match votes
const sessionVotes = new Map<string, Set<string>>();

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
            socketPlayerMap.set(socket.id, { sessionId, playerId });
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

                // If all players are ready, advance to next round
                if (result.allPlayersReady) {
                    const nextRoundData = sessionManager.advanceToNextRound(sessionId);

                    // Broadcast next round to all players
                    io.to(sessionId).emit('next_round', {
                        roundNumber: nextRoundData.newRound,
                        targetColor: nextRoundData.newColors.startColor,
                    });

                    // Start first turn of new round
                    const turnData = sessionManager.startTurn(sessionId);
                    io.to(sessionId).emit('turn_started', turnData);
                } else {
                    // Start next turn
                    const turnData = sessionManager.startTurn(sessionId);
                    io.to(sessionId).emit('turn_started', turnData);
                }

                // Confirm to the submitting player
                socket.emit('round_submitted', result);
            } catch (error) {
                socket.emit('error', { message: (error as Error).message });
            }
        });

        // Handle turn timeout
        socket.on('turn_timeout', ({ sessionId }) => {
            try {
                const result = sessionManager.checkTurnTimeout(sessionId);
                if (result.timeout && result.nextPlayerId) {
                    // Broadcast updated leaderboard (since score was 0)
                    const leaderboardData = sessionManager.getLeaderboard(sessionId);
                    io.to(sessionId).emit('leaderboard_updated', leaderboardData);

                    // Broadcast next turn
                    const session = sessionManager.getSession(sessionId);
                    if (session) {
                        io.to(sessionId).emit('turn_started', {
                            currentTurnPlayerId: result.nextPlayerId,
                            turnEndTime: session.turnEndTime,
                            roundNumber: session.currentRound
                        });
                    }
                }
            } catch (error) {
                console.error('Error handling turn timeout:', error);
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
                socketPlayerMap.delete(socket.id); // Remove from map

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

        // Handle Request New Match
        socket.on('request_new_match', ({ sessionId, playerId }) => {
            if (!sessionId || !playerId) return;

            // Initialize votes for this session if not exists
            if (!sessionVotes.has(sessionId)) {
                sessionVotes.set(sessionId, new Set());
            }

            // Clear previous votes if any (start fresh)
            sessionVotes.get(sessionId)?.clear();
            sessionVotes.get(sessionId)?.add(playerId);

            // Broadcast request to all players
            io.to(sessionId).emit('new_match_requested', {
                requestedBy: playerId
            });
        });

        // Handle Vote New Match
        socket.on('vote_new_match', ({ sessionId, playerId, vote }) => {
            if (!sessionId || !playerId) return;

            if (!sessionVotes.has(sessionId)) {
                sessionVotes.set(sessionId, new Set());
            }

            const votes = sessionVotes.get(sessionId)!;
            if (vote) {
                votes.add(playerId);
            } else {
                votes.delete(playerId);
            }

            // Check if all players have voted YES
            const players = sessionManager.getSessionPlayers(sessionId);
            // We only care about players currently in the session (connected)
            // But getSessionPlayers returns DB players.
            // Ideally we check connected sockets in the room.
            const room = io.sockets.adapter.rooms.get(sessionId);
            const connectedCount = room ? room.size : 0;

            // If votes match connected count (or DB count if we want to be strict)
            // Let's use connected count as proxy for "active" players
            if (votes.size >= connectedCount && connectedCount > 0) {
                // Start countdown
                io.to(sessionId).emit('start_countdown', { duration: 3 });

                // Start match after countdown
                setTimeout(() => {
                    try {
                        const result = sessionManager.resetSessionForNewMatch(sessionId);

                        // Clear votes
                        sessionVotes.delete(sessionId);

                        // Broadcast new match started
                        io.to(sessionId).emit('new_match_started', {
                            roundNumber: result.newRound,
                            targetColor: result.newColors.startColor
                        });

                        // Start first turn
                        const turnData = sessionManager.startTurn(sessionId);
                        io.to(sessionId).emit('turn_started', turnData);
                    } catch (error) {
                        console.error('Error starting new match:', error);
                    }
                }, 3000);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);

            const sessionInfo = socketPlayerMap.get(socket.id);
            if (sessionInfo) {
                const { sessionId, playerId } = sessionInfo;
                console.log(`👻 Ghost player detected: ${playerId} in session ${sessionId}`);

                try {
                    // Check if it was this player's turn
                    const session = sessionManager.getSession(sessionId);
                    if (session && session.currentTurnPlayerId === playerId) {
                        // Advance turn to next player BEFORE removing the current one
                        // This ensures the turn passes to the correct next player in sequence
                        try {
                            const players = sessionManager.getSessionPlayers(sessionId);
                            if (players.length > 1) {
                                const turnData = sessionManager.startTurn(sessionId);
                                io.to(sessionId).emit('turn_started', turnData);
                            }
                        } catch (e) {
                            console.log('Error advancing turn on disconnect:', e);
                        }
                    }

                    // Remove player from database
                    sessionManager.removePlayer(playerId);

                    // Broadcast updated leaderboard
                    const leaderboardData = sessionManager.getLeaderboard(sessionId);
                    io.to(sessionId).emit('leaderboard_updated', leaderboardData);

                    // Broadcast player quit
                    io.to(sessionId).emit('player_quit', { playerId });

                    // Update live games
                    broadcastSessionsUpdate();

                    // Clean up map
                    socketPlayerMap.delete(socket.id);

                    // Remove from votes if present
                    if (sessionVotes.has(sessionId)) {
                        sessionVotes.get(sessionId)?.delete(playerId);
                    }
                } catch (error) {
                    console.error('Error removing ghost player:', error);
                }
            }
        });
    });
}
