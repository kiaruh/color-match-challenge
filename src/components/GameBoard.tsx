'use client';

import React, { useState } from 'react';
import ColorPicker from './ColorPicker';
import { hexToRgb, rgbToHex, calculateDeltaE, calculateScore, getAccuracyDescription } from '../utils/colorUtils';
import { playScoreSound } from '../utils/soundManager';

interface GameBoardProps {
  targetColor: string;
  currentRound: number;
  totalRounds: number;
  onSubmit: (selectedColor: { r: number; g: number; b: number }, distance: number, score: number) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export default function GameBoard({
  targetColor,
  currentRound,
  totalRounds,
  onSubmit,
  isSubmitting = false,
  disabled = false,
}: GameBoardProps) {
  const [selectedColor, setSelectedColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{
    distance: number;
    score: number;
    accuracy: string;
  } | null>(null);

  const handleColorSelect = (color: { r: number; g: number; b: number }) => {
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
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Status Bar */}
      <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Round</span>
          <span className="font-mono text-lg font-medium text-[var(--text-primary)]">
            {currentRound} <span className="text-[var(--text-tertiary)]">/</span> {totalRounds}
          </span>
        </div>

        {/* Result Badge (Inline) */}
        {showResult && result && (
          <div className="animate-fadeIn flex items-center gap-4">
            <div className={`px-3 py-1 rounded-[var(--radius-sm)] text-sm font-medium ${result.score > 800 ? 'bg-[var(--accent-success-bg)] text-[var(--accent-success)]' :
                result.score > 500 ? 'bg-[var(--accent-warning-bg)] text-[var(--accent-warning)]' :
                  'bg-[var(--accent-error-bg)] text-[var(--accent-error)]'
              }`}>
              {result.accuracy}
            </div>
            <div className="font-mono font-bold text-[var(--text-primary)]">
              +{result.score} pts
            </div>
          </div>
        )}
      </div>

      {/* Color Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Target */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Target</span>
            <code className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">{targetColor.toUpperCase()}</code>
          </div>
          <div
            className="w-full aspect-square rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] border border-[var(--border-primary)] transition-transform duration-200 hover:scale-[1.01]"
            style={{ backgroundColor: targetColor }}
          />
        </div>

        {/* Selection */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Your Match</span>
            {selectedColor && (
              <code className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">
                {rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b).toUpperCase()}
              </code>
            )}
          </div>
          <div
            className="w-full aspect-square rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] border border-[var(--border-primary)] transition-transform duration-200 hover:scale-[1.01] flex items-center justify-center bg-[var(--bg-secondary)]"
            style={{
              backgroundColor: selectedColor
                ? `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`
                : 'var(--bg-secondary)'
            }}
          >
            {!selectedColor && (
              <span className="text-4xl text-[var(--text-tertiary)] opacity-50 font-light">?</span>
            )}
          </div>
        </div>
      </div>

      {/* Color Picker */}
      <div className={`transition-opacity duration-300 ${showResult ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <ColorPicker
          onColorSelect={handleColorSelect}
          disabled={showResult || isSubmitting || disabled}
        />
      </div>
    </div>
  );
}
