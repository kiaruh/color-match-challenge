import { useCallback } from 'react';
import { rgbToHex, generateDistinctColor } from '../utils/colorUtils';
import { GamePhase } from '../types';

interface UseMultiplayerModeProps {
    session: any; // Type should be imported from api
    playerId: string | null;
    currentRound: number;
    targetColor: string;
    wsSubmitRound: (sessionId: string, playerId: string, data: any) => void;
    setCurrentRound: (round: number) => void;
    setTargetColor: (color: string) => void;
    setGamePhase: (phase: GamePhase) => void;
}

export function useMultiplayerMode({
    session,
    playerId,
    currentRound,
    targetColor,
    wsSubmitRound,
    setCurrentRound,
    setTargetColor,
    setGamePhase
}: UseMultiplayerModeProps) {

    const submitMultiplayerRound = useCallback((
        selectedColor: { r: number; g: number; b: number },
        distance: number,
        score: number
    ) => {
        if (!session || !playerId) return;

        const selectedHex = rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b);

        // Submit via WebSocket
        wsSubmitRound(session.id, playerId, {
            roundNumber: currentRound,
            targetColor,
            selectedColor: selectedHex,
            distance,
            score,
        });

        // Move to next round or finish
        if (currentRound < (session.totalRounds || 3)) {
            setCurrentRound(currentRound + 1);
            // Generate new target color locally? 
            // In multiplayer, target color usually comes from server for fairness?
            // But original code did local generation:
            // const newTargetColor = generateDistinctColor(targetColor, 50);
            // setTargetColor(newTargetColor);

            // Wait, if it's simultaneous rounds, everyone should have same color.
            // If it's horse race (turn based?), it might differ?
            // Original code:
            // const newTargetColor = generateDistinctColor(targetColor, 50);
            // setTargetColor(newTargetColor);

            const newTargetColor = generateDistinctColor(targetColor, 50);
            setTargetColor(newTargetColor);
        } else {
            // In continuous mode, move to waiting state
            setGamePhase('waiting');
        }
    }, [
        session,
        playerId,
        currentRound,
        targetColor,
        wsSubmitRound,
        setCurrentRound,
        setTargetColor,
        setGamePhase
    ]);

    return { submitMultiplayerRound };
}
