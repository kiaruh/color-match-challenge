import { useState, useCallback } from 'react';
import { GamePhase } from '../types';
import { LeaderboardEntry } from '../utils/api';
import { generateDistinctColor, rgbToHex } from '../utils/colorUtils';

export function useGameState() {
    const [gamePhase, setGamePhase] = useState<GamePhase>('landing');
    const [currentRound, setCurrentRound] = useState(1);
    const [targetColor, setTargetColor] = useState('#000000');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [winner, setWinner] = useState<LeaderboardEntry | null>(null);
    const [isSinglePlayer, setIsSinglePlayer] = useState(false);
    const [singlePlayerScore, setSinglePlayerScore] = useState(0);
    const [totalRounds, setTotalRounds] = useState(3);

    const resetGame = useCallback(() => {
        setGamePhase('landing');
        setCurrentRound(1);
        setLeaderboard([]);
        setWinner(null);
        setIsSinglePlayer(false);
        setSinglePlayerScore(0);
    }, []);

    const startSoloGame = useCallback((startColor: string) => {
        setIsSinglePlayer(true);
        setTargetColor(startColor);
        setCurrentRound(1);
        setSinglePlayerScore(0);
        setGamePhase('playing');
        setTotalRounds(8);
    }, []);

    const startMultiplayerGame = useCallback((startColor: string, rounds: number) => {
        setIsSinglePlayer(false);
        setTargetColor(startColor);
        setCurrentRound(1);
        setGamePhase('playing');
        setTotalRounds(rounds);
    }, []);

    const advanceRound = useCallback((newTargetColor: string) => {
        setCurrentRound(prev => prev + 1);
        setTargetColor(newTargetColor);
    }, []);

    return {
        gamePhase,
        setGamePhase,
        currentRound,
        setCurrentRound,
        targetColor,
        setTargetColor,
        leaderboard,
        setLeaderboard,
        winner,
        setWinner,
        isSinglePlayer,
        setIsSinglePlayer,
        singlePlayerScore,
        setSinglePlayerScore,
        totalRounds,
        setTotalRounds,
        resetGame,
        startSoloGame,
        startMultiplayerGame,
        advanceRound
    };
}
