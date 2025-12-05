import { useState, useCallback } from 'react';
import { hexToRgb, calculateDeltaE, calculateScore, getAccuracyDescription } from '../utils/colorUtils';
import { playScoreSound } from '../utils/soundManager';

interface UseGameBoardProps {
    targetColor: string;
    onSubmit: (selectedColor: { r: number; g: number; b: number }, distance: number, score: number) => void;
    isSubmitting: boolean;
}

export function useGameBoard({ targetColor, onSubmit, isSubmitting }: UseGameBoardProps) {
    const [selectedColor, setSelectedColor] = useState<{ r: number; g: number; b: number } | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<{
        distance: number;
        score: number;
        accuracy: string;
    } | null>(null);

    const handleColorSelect = useCallback((color: { r: number; g: number; b: number }) => {
        if (showResult || isSubmitting) return;

        setSelectedColor(color);

        const targetRgb = hexToRgb(targetColor);
        if (!targetRgb) return;

        const distance = calculateDeltaE(targetRgb, color);
        const score = calculateScore(distance);
        const accuracy = getAccuracyDescription(distance);

        setResult({ distance, score, accuracy });
        setShowResult(true);

        // Play sound based on score
        playScoreSound(score);

        // Call parent callback after a short delay to show result
        setTimeout(() => {
            onSubmit(color, distance, score);
            setShowResult(false);
            setResult(null);
            setSelectedColor(null);
        }, 2500);
    }, [targetColor, showResult, isSubmitting, onSubmit]);

    return {
        selectedColor,
        showResult,
        result,
        handleColorSelect
    };
}
