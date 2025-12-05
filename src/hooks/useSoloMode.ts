import { useCallback } from 'react';
import { LeaderboardEntry } from '../utils/api';
import { generateDistinctColor } from '../utils/colorUtils';
import { GamePhase } from '../types';

interface UseSoloModeProps {
    currentRound: number;
    targetColor: string;
    singlePlayerScore: number;
    setSinglePlayerScore: (score: number) => void;
    setLeaderboard: (entries: LeaderboardEntry[]) => void;
    setWinner: (winner: LeaderboardEntry | null) => void;
    setCurrentRound: (round: number) => void;
    setTargetColor: (color: string) => void;
    setGamePhase: (phase: GamePhase) => void;
    username: string;
}

export function useSoloMode({
    currentRound,
    targetColor,
    singlePlayerScore,
    setSinglePlayerScore,
    setLeaderboard,
    setWinner,
    setCurrentRound,
    setTargetColor,
    setGamePhase,
    username
}: UseSoloModeProps) {

    const submitSoloRound = useCallback((score: number) => {
        const newTotalScore = singlePlayerScore + score;
        setSinglePlayerScore(newTotalScore);

        // Update leaderboard
        setLeaderboard([{
            playerId: 'solo-player',
            username: 'You', // Or use username prop
            bestScore: score, // This seems to track best round score in current impl? Or just current round score?
            // In page.tsx it was: bestScore: score. 
            // Wait, leaderboard usually tracks total score? 
            // The interface says 'bestScore'. 
            // In solo mode, 'bestScore' might act as 'latest round score' for display?
            // Let's stick to original logic: bestScore: score
            totalScore: newTotalScore,
            completedRounds: currentRound,
            isFinished: currentRound >= 8,
            isWaiting: false
        }]);

        setWinner({
            playerId: 'solo-player',
            username: 'You',
            bestScore: score,
            totalScore: newTotalScore,
            completedRounds: currentRound,
            isFinished: true,
            isWaiting: false
        });

        if (currentRound >= 8) {
            setGamePhase('solo_results');
        } else {
            setCurrentRound(currentRound + 1);
            const newTargetColor = generateDistinctColor(targetColor, 50);
            setTargetColor(newTargetColor);
        }
    }, [
        currentRound,
        targetColor,
        singlePlayerScore,
        setSinglePlayerScore,
        setLeaderboard,
        setWinner,
        setCurrentRound,
        setTargetColor,
        setGamePhase,
        username
    ]);

    return { submitSoloRound };
}
