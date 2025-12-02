'use client';

interface GameControlsProps {
    onQuit: () => void;
    onRematch?: () => void;
    showRematch?: boolean;
}

export default function GameControls({ onQuit, onRematch, showRematch = false }: GameControlsProps) {
    return (
        <div className="game-controls">
            {showRematch && onRematch && (
                <button
                    className="control-btn rematch-btn"
                    onClick={onRematch}
                >
                    🔄 New Match
                </button>
            )}

            <button
                className="control-btn quit-btn"
                onClick={onQuit}
            >
                🚪 Quit Game
            </button>

            <style jsx>{`
        .game-controls {
          display: flex;
          gap: var(--spacing-md);
          margin-top: var(--spacing-md);
        }

        .control-btn {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-lg);
          font-weight: 600;
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
        }

        .rematch-btn {
          background: var(--color-primary);
          color: white;
          border: none;
        }

        .rematch-btn:hover {
          background: var(--color-primary-dark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .quit-btn {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
          border: 1px solid var(--color-error);
        }

        .quit-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
        }
      `}</style>
        </div>
    );
}
