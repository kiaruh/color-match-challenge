'use client';

import { useState } from 'react';
import { ActiveSession } from '../utils/api';

interface LiveGamesListProps {
  sessions: ActiveSession[];
  onJoin: (sessionId: string, password?: string) => void;
  onRefresh?: () => void;
  isLoading: boolean;
  error?: string | null;
}

export default function LiveGamesList({ sessions, onJoin, onRefresh, isLoading, error }: LiveGamesListProps) {
  const [passwordPrompt, setPasswordPrompt] = useState<{ sessionId: string; show: boolean }>({ sessionId: '', show: false });
  const [passwordInput, setPasswordInput] = useState('');

  const handleJoinClick = (session: ActiveSession) => {
    if (session.hasPassword) {
      setPasswordPrompt({ sessionId: session.id, show: true });
      setPasswordInput('');
    } else {
      onJoin(session.id);
    }
  };

  const handlePasswordSubmit = () => {
    onJoin(passwordPrompt.sessionId, passwordInput);
    setPasswordPrompt({ sessionId: '', show: false });
    setPasswordInput('');
  };
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
              onClick={() => handleJoinClick(session)}
              disabled={session.playerCount >= (session.maxPlayers || 4)}
            >
              {session.playerCount >= (session.maxPlayers || 4) ? 'Full' : 'Join'}
            </button>
          </div>
        ))}
      </div>

      {/* Password prompt modal */}
      {passwordPrompt.show && (
        <div className="modal-overlay" onClick={() => setPasswordPrompt({ sessionId: '', show: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Password Required</h3>
            <p>This game is password-protected</p>
            <input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              autoFocus
              className="password-input"
            />
            <div className="modal-actions">
              <button onClick={() => setPasswordPrompt({ sessionId: '', show: false })} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handlePasswordSubmit} className="submit-btn">
                Join Game
              </button>
            </div>
          </div>
        </div>
      )}

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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s;
        }

        .modal-content {
          background: var(--color-bg-card);
          padding: var(--spacing-xl);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
          max-width: 400px;
          width: 90%;
          animation: scaleIn 0.2s;
        }

        .modal-content h3 {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--color-text-primary);
        }

        .modal-content p {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }

        .password-input {
          width: 100%;
          padding: var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-bg-darker);
          color: var(--color-text-primary);
          font-size: var(--font-size-base);
          margin-bottom: var(--spacing-md);
        }

        .modal-actions {
          display: flex;
          gap: var(--spacing-sm);
          justify-content: flex-end;
        }

        .cancel-btn, .submit-btn {
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .cancel-btn {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
        }

        .cancel-btn:hover {
          background: var(--color-bg-darker);
        }

        .submit-btn {
          background: var(--color-primary);
          border: none;
          color: white;
        }

        .submit-btn:hover {
          opacity: 0.9;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
