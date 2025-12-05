import { useState, useCallback } from 'react';
import { Session, createSession, joinSession, getSession } from '../utils/api';
import { generateRandomUsername } from '../utils/usernameGenerator';

export function useSessionManager() {
    const [session, setSession] = useState<Session | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionPassword, setSessionPassword] = useState('');
    const [joinPassword, setJoinPassword] = useState('');

    const generateNewUsername = useCallback(() => {
        setUsername(generateRandomUsername());
    }, []);

    const resetSession = useCallback(() => {
        setSession(null);
        setPlayerId(null);
        setError(null);
        setSessionPassword('');
        setJoinPassword('');
    }, []);

    const createGame = useCallback(async (maxPlayers: number, totalRounds: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const validMaxPlayers = Math.min(20, Math.max(2, maxPlayers));
            const validTotalRounds = Math.min(10, Math.max(1, totalRounds));

            const newSession = await createSession(
                undefined,
                undefined,
                sessionPassword || undefined,
                validMaxPlayers,
                validTotalRounds
            );
            setSession(newSession);

            const finalUsername = username || generateRandomUsername();
            setUsername(finalUsername);

            const joinResponse = await joinSession(newSession.id, finalUsername, sessionPassword || undefined);
            setPlayerId(joinResponse.playerId);

            return { session: newSession, playerId: joinResponse.playerId, username: finalUsername };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create session');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [sessionPassword, username]);

    const joinGame = useCallback(async (sessionId: string, password?: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const existingSession = await getSession(sessionId);
            setSession(existingSession);

            const finalUsername = username || generateRandomUsername();
            setUsername(finalUsername);

            const joinResponse = await joinSession(sessionId, finalUsername, password || joinPassword || undefined);
            setPlayerId(joinResponse.playerId);

            return {
                session: existingSession,
                playerId: joinResponse.playerId,
                username: finalUsername,
                currentRound: joinResponse.currentRound
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to join session');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [joinPassword, username]);

    return {
        session,
        setSession,
        playerId,
        setPlayerId,
        username,
        setUsername,
        isLoading,
        setIsLoading,
        error,
        setError,
        sessionPassword,
        setSessionPassword,
        joinPassword,
        setJoinPassword,
        generateNewUsername,
        resetSession,
        createGame,
        joinGame
    };
}
