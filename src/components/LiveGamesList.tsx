'use client';

import { ActiveSession } from '../utils/api';

interface LiveGamesListProps {
  sessions: ActiveSession[];
  onJoin: (sessionId: string) => void;
  onRefresh?: () => void;
  isLoading: boolean;
  error?: string | null;
}

export default function LiveGamesList({ sessions, onJoin, onRefresh, isLoading, error }: LiveGamesListProps) {
  if (error) {
    return (
      <div className="live-games-error">
        <p>⚠️ {error}</p>
        {onRefresh && (
          <button onClick={onRefresh} className="refresh-btn">
            Try Again
          </button>
        )}
        <style jsx>{`
          .live-games-error {
            text-align: center;
            padding: var(--spacing-lg);
            color: var(--color-error);
            background: rgba(255, 0, 0, 0.1);
            border-radius: var(--radius-lg);
            margin-top: var(--spacing-xl);
          }
          .refresh-btn {
            margin-top: var(--spacing-sm);
            padding: var(--spacing-xs) var(--spacing-md);
            background: var(--color-bg-card);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }
  // If loading and we have no sessions, show spinner
  if (isLoading && sessions.length === 0) {
    return (
      <div className="live-games-loading">
        <div className="loading-spinner"></div>
        <p>Scouting for live games...</p>
      </div>
    );
  }

  // If no sessions (and not loading), show fun empty state
  if (sessions.length === 0) {
    return (
      <div className="live-games-list">
        <h3 className="list-title">
          <span className="live-indicator">●</span> Live Games
        </h3>
        <div className="empty-state-card glass">
          <div className="empty-icon">👻</div>
          <div className="empty-content">
            <h4>It's quiet... too quiet.</h4>
            <p>Be the first to start a match and challenge others!</p>
            {onRefresh && (
              <button onClick={onRefresh} className="refresh-link">
                ↻ Refresh List
              </button>
            )}
          </div>
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
          .empty-state-card {
            padding: var(--spacing-lg);
            border-radius: var(--radius-lg);
            background: var(--color-bg-card);
            border: 2px dashed var(--color-border);
            display: flex;
            align-items: center;
            gap: var(--spacing-lg);
            opacity: 0.8;
          }
          .empty-icon {
            font-size: 2.5rem;
            animation: float 3s ease-in-out infinite;
          }
          .empty-content h4 {
            margin: 0 0 var(--spacing-xs) 0;
            color: var(--color-text-primary);
          }
          .empty-content p {
            margin: 0;
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
          }
          .refresh-link {
            background: none;
            border: none;
            color: var(--color-primary);
            text-decoration: underline;
            cursor: pointer;
            padding: 0;
            margin-top: var(--spacing-xs);
            font-size: var(--font-size-xs);
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="live-games-list">
      <h3 className="list-title">
        <span><span className="live-indicator">●</span> Live Games</span>
        {onRefresh && (
          <button onClick={onRefresh} className="refresh-icon-btn" title="Refresh">
            ↻
          </button>
        )}
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
