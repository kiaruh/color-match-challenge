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
      <div className="p-4 bg-[var(--accent-error-bg)] text-[var(--accent-error)] rounded-[var(--radius-md)] text-sm text-center">
        <p className="mb-2">⚠️ {error}</p>
        {onRefresh && (
          <button onClick={onRefresh} className="underline hover:text-[var(--text-primary)]">
            Try Again
          </button>
        )}
      </div>
    );
  }

  // If loading and we have no sessions, show spinner
  if (isLoading && sessions.length === 0) {
    return (
      <div className="py-8 text-center text-[var(--text-secondary)]">
        <div className="w-5 h-5 border-2 border-[var(--border-primary)] border-t-[var(--text-primary)] rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm">Scouting for live games...</p>
      </div>
    );
  }

  // If no sessions (and not loading), show fun empty state
  if (sessions.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-error)] animate-pulse"></span>
            Live Games
          </h3>
          {onRefresh && (
            <button onClick={onRefresh} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Refresh">
              ↻
            </button>
          )}
        </div>

        <div className="surface-card p-8 text-center border-dashed border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
          <div className="text-4xl mb-3 opacity-50">👻</div>
          <h4 className="text-[var(--text-primary)] font-medium mb-1">It's quiet... too quiet.</h4>
          <p className="text-sm text-[var(--text-secondary)] mb-3">Be the first to start a match!</p>
          {onRefresh && (
            <button onClick={onRefresh} className="text-xs text-[var(--accent-primary)] hover:underline">
              Refresh List
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-error)] animate-pulse"></span>
          Live Games
        </h3>
        {onRefresh && (
          <button onClick={onRefresh} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Refresh">
            ↻
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {sessions.map((session) => (
          <div key={session.id} className="surface-card p-3 flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors group">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[var(--text-secondary)]">ID:</span>
                <code className="font-mono font-semibold text-[var(--text-primary)]">{session.id.slice(0, 8)}</code>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  👥 {session.playerCount}/{session.maxPlayers || 4}
                </span>
                {session.hasPassword && (
                  <span className="flex items-center gap-1" title="Password Protected">🔒 Locked</span>
                )}
              </div>
            </div>

            <button
              className="px-3 py-1.5 text-sm font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-[var(--radius-sm)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setPasswordPrompt({ sessionId: '', show: false })}>
          <div className="surface-card p-6 w-full max-w-sm shadow-lg animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Password Required</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">This game is password-protected</p>

            <input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              autoFocus
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[var(--radius-sm)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPasswordPrompt({ sessionId: '', show: false })}
                className="px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-[var(--radius-sm)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-3 py-2 text-sm bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity"
              >
                Join Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
