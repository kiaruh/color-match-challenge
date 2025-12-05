import { useState, useEffect, useCallback } from 'react';
import { ActiveSession, getActiveSessions } from '../utils/api';

export function useLiveGames(shouldPoll: boolean) {
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) setIsLoading(true);
            const sessions = await getActiveSessions();
            setActiveSessions(sessions);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch active sessions:', err);
            setError(err instanceof Error ? err.message : 'Failed to load games');
        } finally {
            if (isInitial) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!shouldPoll) return;

        fetchSessions(true);

        const interval = setInterval(() => {
            fetchSessions(false);
        }, 2000);

        return () => clearInterval(interval);
    }, [shouldPoll, fetchSessions]);

    return {
        activeSessions,
        isLoading,
        error,
        refreshSessions: () => fetchSessions(true)
    };
}
