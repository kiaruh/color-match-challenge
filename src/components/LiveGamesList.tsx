'use client';

import { ActiveSession } from '../utils/api';

interface LiveGamesListProps {
    sessions: ActiveSession[];
    onJoin: (sessionId: string) => void;
    isLoading: boolean;
}

export default function LiveGamesList({ sessions, onJoin, isLoading }: LiveGamesListProps) {
    if (isLoading && sessions.length === 0) {
        return (
            <div className="live-games-loading">
                <div className="loading-spinner"></div>
                <p>Loading active games...</p>
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="no-games">
                <p>No active games found. Create one to start playing!</p>
            </div>
        );
    }

    return (
        <div className="live-games-list">
            <h3 className="list-title">
                <span className="live-indicator">●</span> Live Games
            </h3>

            <div className="games-grid">
                {sessions.map((session) => (
                    <div key={session.id} className="game-card glass-hover">
                        <div className="game-info">
                            <div className="game-id">
                                <span className="label">ID:</span>
                                <code className="value">{session.id.slice(0, 8)}...</code>
                            </div>
                            <div className="game-stats">
                                <span className="player-count">
                                    👥 {session.playerCount}/{session.maxPlayers || 4}
                                </span>
                                {session.hasPassword && (
                                    <span className="locked-icon" title="Password Protected">🔒</span>
                                )}
                            </div>
                        </div>

                        <button
                            className="join-btn"
                            onClick={() => onJoin(session.id)}
                            disabled={session.playerCount >= (session.maxPlayers || 4)}
                        >
                            {session.playerCount >= (session.maxPlayers || 4) ? 'Full' : 'Join'}
                        </button>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .live-games-list {
          width: 100%;
          margin-top: var(--spacing-xl);
        }

        .list-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--font-size-lg);
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-md);
        }

        .live-indicator {
          color: var(--color-error);
          animation: pulse 2s infinite;
          font-size: var(--font-size-sm);
        }

        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--spacing-md);
        }

        .game-card {
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all var(--transition-base);
        }

        .game-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }

        .game-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .game-id {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--font-size-sm);
        }

        .label {
          color: var(--color-text-secondary);
        }

        .value {
          font-family: 'Courier New', monospace;
          color: var(--color-primary);
          font-weight: 600;
        }

        .game-stats {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
        }

        .locked-icon {
          font-size: var(--font-size-sm);
        }

        .join-btn {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-text-primary);
          background: var(--color-bg-darker);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .join-btn:hover:not(:disabled) {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .join-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .live-games-loading, .no-games {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto var(--spacing-sm);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
