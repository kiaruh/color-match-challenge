'use client';

import React from 'react';
import ColorPicker from './ColorPicker';
import { rgbToHex } from '../utils/colorUtils';
import { useGameBoard } from '../hooks/useGameBoard';

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
  const {
    selectedColor,
    showResult,
    result,
    handleColorSelect
  } = useGameBoard({ targetColor, onSubmit, isSubmitting });

  return (
    <div className="game-board">
      {/* Round Indicator */}
      <div className="round-indicator">
        <div className="round-text">Round</div>
        <div className="round-number">
          {currentRound} / {totalRounds}
        </div>
      </div>

      {/* Color Comparison */}
      <div className="color-comparison">
        <div className="color-section">
          <div className="color-label">Target Color</div>
          <div
            className="color-display target-color"
            style={{ backgroundColor: targetColor }}
          />
          <div className="color-code">{targetColor.toUpperCase()}</div>
        </div>

        <div className="vs-divider">VS</div>

        <div className="color-section">
          <div className="color-label">Your Selection</div>
          <div
            className="color-display selected-color"
            style={{
              backgroundColor: selectedColor
                ? `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`
                : 'transparent',
              borderStyle: selectedColor ? 'solid' : 'dashed',
              opacity: selectedColor ? 1 : 0.5
            }}
          >
            {!selectedColor && <span className="placeholder-text">?</span>}
          </div>
          <div className="color-code">
            {selectedColor
              ? rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b).toUpperCase()
              : 'Waiting for selection...'}
          </div>
        </div>
      </div>

      {/* Result Display */}
      {showResult && result && (
        <div className="result-display animate-scaleIn">
          <div className="result-accuracy" style={{
            color: result.score > 800 ? 'var(--color-success)' :
              result.score > 500 ? 'var(--color-warning)' :
                'var(--color-error)'
          }}>
            {result.accuracy}
          </div>
          <div className="result-score">{result.score} points</div>
          <div className="result-distance">ΔE: {result.distance.toFixed(2)}</div>
        </div>
      )}

      {/* Color Picker */}
      <div className={`picker-section animate-fadeIn ${showResult ? 'disabled' : ''}`}>
        <ColorPicker
          onColorSelect={handleColorSelect}
          disabled={showResult || isSubmitting || disabled}
        />
      </div>

      <style jsx>{`
        .game-board {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2xl);
          width: 100%;
          max-width: 600px;
        }

        .round-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--gradient-primary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-glow);
        }

        .round-text {
          font-size: var(--font-size-sm);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: white;
        }

        .round-number {
          font-size: var(--font-size-2xl);
          font-weight: 800;
          color: white;
          font-family: 'Courier New', monospace;
        }

        .color-comparison {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: var(--spacing-lg);
          align-items: center;
        }

        .color-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
        }

        .color-label {
          font-size: var(--font-size-sm);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
        }

        .color-display {
          width: 150px;
          height: 150px;
          border-radius: var(--radius-xl);
          border: 3px solid var(--color-border);
          box-shadow: var(--shadow-xl);
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-text {
          font-size: var(--font-size-4xl);
          color: var(--color-text-muted);
          font-weight: 700;
        }

        .color-display:hover {
          transform: scale(1.05);
        }

        .target-color {
          animation: glow 2s ease-in-out infinite;
        }

        .color-code {
          font-family: 'Courier New', monospace;
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          background: var(--color-bg-card);
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          min-width: 120px;
          text-align: center;
        }

        .vs-divider {
          font-size: var(--font-size-xl);
          font-weight: 800;
          color: var(--color-text-muted);
          padding: var(--spacing-md);
          background: var(--color-bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }

        .result-display {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-2xl);
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          pointer-events: none;
        }

        .result-accuracy {
          font-size: var(--font-size-3xl);
          font-weight: 800;
          animation: float 2s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .result-score {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: 'Courier New', monospace;
        }

        .result-distance {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          font-family: 'Courier New', monospace;
        }

        .picker-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
          transition: opacity 0.3s ease;
        }

        .picker-section.disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .color-comparison {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }

          .vs-divider {
            transform: rotate(90deg);
          }

          .color-display {
            width: 120px;
            height: 120px;
          }
        }
      `}</style>
    </div>
  );
}
