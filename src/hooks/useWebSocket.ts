'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { LeaderboardResponse } from '../utils/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface UseWebSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    joinSession: (sessionId: string, playerId: string) => void;
    submitRound: (sessionId: string, playerId: string, roundData: RoundData) => void;
    onLeaderboardUpdate: (callback: (data: LeaderboardResponse) => void) => void;
    onPlayerJoined: (callback: (data: { playerId: string; username: string }) => void) => void;
    onSessionComplete: (callback: (data: { winner: any }) => void) => void;
    onError: (callback: (error: { message: string }) => void) => void;
}

interface RoundData {
    roundNumber: number;
    targetColor: string;
    selectedColor: string;
    distance: number;
    score: number;
}

export function useWebSocket(): UseWebSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Initialize socket connection
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        // Connection event handlers
        socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const joinSession = (sessionId: string, playerId: string) => {
        if (socketRef.current) {
            socketRef.current.emit('join_session', { sessionId, playerId });
        }
    };

    const submitRound = (sessionId: string, playerId: string, roundData: RoundData) => {
        if (socketRef.current) {
            socketRef.current.emit('round_completed', {
                sessionId,
                playerId,
                roundData,
            });
        }
    };

    const onLeaderboardUpdate = (callback: (data: LeaderboardResponse) => void) => {
        if (socketRef.current) {
            socketRef.current.on('leaderboard_updated', callback);
        }
    };

    const onPlayerJoined = (callback: (data: { playerId: string; username: string }) => void) => {
        if (socketRef.current) {
            socketRef.current.on('player_joined', callback);
        }
    };

    const onSessionComplete = (callback: (data: { winner: any }) => void) => {
        if (socketRef.current) {
            socketRef.current.on('session_complete', callback);
        }
    };

    const onError = (callback: (error: { message: string }) => void) => {
        if (socketRef.current) {
            socketRef.current.on('error', callback);
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        joinSession,
        submitRound,
        onLeaderboardUpdate,
        onPlayerJoined,
        onSessionComplete,
        onError,
    };
}
