'use client';

import { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard';
import Leaderboard from '../components/Leaderboard';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  createSession,
  joinSession,
  getSession,
  LeaderboardEntry,
  Session,
} from '../utils/api';
import { rgbToHex, generateDistinctColor } from '../utils/colorUtils';

type GamePhase = 'landing' | 'playing' | 'results';

export default function Home() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('landing');
  const [session, setSession] = useState<Session | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [currentRound, setCurrentRound] = useState(1);
  const [targetColor, setTargetColor] = useState('#000000');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [winner, setWinner] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinSessionId, setJoinSessionId] = useState('');

  const { isConnected, joinSession: wsJoinSession, submitRound: wsSubmitRound, onLeaderboardUpdate, onPlayerJoined, onSessionComplete, onError } = useWebSocket();

  // Set up WebSocket event listeners
  useEffect(() => {
    onLeaderboardUpdate((data) => {
      setLeaderboard(data.leaderboard);
      if (data.winner) {
        setWinner(data.winner);
      }
    });

    onPlayerJoined((data) => {
      console.log('Player joined:', data);
    });

    onSessionComplete((data) => {
      setWinner(data.winner);
      setGamePhase('results');
    });

    onError((error) => {
      setError(error.message);
    });
  }, [onLeaderboardUpdate, onPlayerJoined, onSessionComplete, onError]);

  const handleCreateSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create session
      const newSession = await createSession();
      setSession(newSession);

      // Join the session
      const joinResponse = await joinSession(newSession.id);
      setPlayerId(joinResponse.playerId);
      setUsername(joinResponse.username);

      // Join WebSocket room
      wsJoinSession(newSession.id, joinResponse.playerId);

      // Set target color for first round
      setTargetColor(newSession.startColor);
      setCurrentRound(1);
      setGamePhase('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get session details
      const existingSession = await getSession(joinSessionId);
      setSession(existingSession);

      // Join the session
      const joinResponse = await joinSession(joinSessionId);
      setPlayerId(joinResponse.playerId);
      setUsername(joinResponse.username);
      setCurrentRound(joinResponse.currentRound);

      // Join WebSocket room
      wsJoinSession(joinSessionId, joinResponse.playerId);

      // Set target color
      setTargetColor(existingSession.startColor);
      setGamePhase('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRound = async (
    selectedColor: { r: number; g: number; b: number },
    distance: number,
    score: number
  ) => {
    if (!session || !playerId) return;

    try {
      setIsLoading(true);

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
      if (currentRound < 3) {
        setCurrentRound(currentRound + 1);
        // Generate new target color that's significantly different from current
        const newTargetColor = generateDistinctColor(targetColor, 50);
        setTargetColor(newTargetColor);
      } else {
        // All rounds complete
        setGamePhase('results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit round');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAgain = () => {
    setGamePhase('landing');
    setSession(null);
    setPlayerId(null);
    setUsername('');
    setCurrentRound(1);
    setLeaderboard([]);
    setWinner(null);
    setError(null);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title animate-fadeIn">
          <span className="title-gradient">Color Match Challenge</span>
        </h1>
        <p className="app-subtitle animate-fadeIn">
          Test your color perception skills
        </p>
        {isConnected && (
          <div className="connection-status">
            <span className="status-dot" />
            Connected
          </div>
        )}
      </header>

      <main className="app-main">
        {/* Landing Phase */}
        {gamePhase === 'landing' && (
          <div className="landing-container animate-scaleIn">
            <div className="landing-card glass">
              <h2 className="landing-title">Ready to Play?</h2>
              <p className="landing-description">
                Match colors as closely as possible across 3 rounds. Compete with others in real-time!
              </p>

              <div className="action-buttons">
                <button
                  className="primary-button"
                  onClick={handleCreateSession}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create New Game'}
                </button>

                <div className="divider">
                  <span>or</span>
                </div>

                <div className="join-form">
                  <input
                    type="text"
                    placeholder="Enter Session ID"
                    value={joinSessionId}
                    onChange={(e) => setJoinSessionId(e.target.value)}
                    className="session-input"
                  />
                  <button
                    className="secondary-button"
                    onClick={handleJoinSession}
                    disabled={isLoading || !joinSessionId}
                  >
                    Join Game
                  </button>
                </div>
              </div>

              {session && (
                <div className="session-info">
                  <p className="session-label">Session ID:</p>
                  <div className="session-id-display">
                    <code>{session.id}</code>
                    <button
                      className="copy-button"
                      onClick={() => navigator.clipboard.writeText(session.id)}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}
            </div>

            <div className="features-grid">
              <div className="feature-card glass-hover">
                <div className="feature-icon">🎨</div>
                <h3 className="feature-title">Color Perception</h3>
                <p className="feature-description">
                  Test your ability to match colors using RGB sliders
                </p>
              </div>
              <div className="feature-card glass-hover">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Real-time Multiplayer</h3>
                <p className="feature-description">
                  Compete with others and see live leaderboard updates
                </p>
              </div>
              <div className="feature-card glass-hover">
                <div className="feature-icon">🏆</div>
                <h3 className="feature-title">Score & Win</h3>
                <p className="feature-description">
                  Earn points based on color accuracy and climb the ranks
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Playing Phase */}
        {gamePhase === 'playing' && session && playerId && (
          <div className="game-container">
            <div className="game-content">
              <GameBoard
                targetColor={targetColor}
                currentRound={currentRound}
                totalRounds={3}
                onSubmit={handleSubmitRound}
                isSubmitting={isLoading}
              />
            </div>

            <aside className="game-sidebar">
              {session && (
                <div className="session-card glass">
                  <div className="session-header">Session Info</div>
                  <div className="session-details">
                    <div className="detail-row">
                      <span className="detail-label">ID:</span>
                      <code className="detail-value">{session.id.slice(0, 8)}...</code>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Player:</span>
                      <span className="detail-value">{username}</span>
                    </div>
                  </div>
                </div>
              )}

              <Leaderboard
                entries={leaderboard}
                currentPlayerId={playerId}
                winner={winner}
              />
            </aside>
          </div>
        )}

        {/* Results Phase */}
        {gamePhase === 'results' && (
          <div className="results-container animate-scaleIn">
            <div className="results-card glass">
              <h2 className="results-title">Game Complete!</h2>

              {winner && (
                <div className="winner-section">
                  <div className="winner-crown">👑</div>
                  <div className="winner-text">{winner.username} wins!</div>
                  <div className="winner-points">{winner.bestScore} points</div>
                </div>
              )}

              <Leaderboard
                entries={leaderboard}
                currentPlayerId={playerId || undefined}
                winner={winner}
              />

              <button className="primary-button" onClick={handlePlayAgain}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: var(--spacing-xl);
        }

        .app-header {
          text-align: center;
          margin-bottom: var(--spacing-3xl);
          position: relative;
        }

        .app-title {
          font-size: var(--font-size-5xl);
          font-weight: 800;
          margin: 0 0 var(--spacing-md) 0;
        }

        .title-gradient {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .app-subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
          margin: 0;
        }

        .connection-status {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--font-size-sm);
          color: var(--color-success);
          background: var(--color-bg-card);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--color-success);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .app-main {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .landing-container {
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2xl);
        }

        .landing-card {
          padding: var(--spacing-3xl);
          border-radius: var(--radius-2xl);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
        }

        .landing-title {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
          text-align: center;
        }

        .landing-description {
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
          text-align: center;
          margin: 0;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .primary-button {
          padding: var(--spacing-lg) var(--spacing-2xl);
          font-size: var(--font-size-lg);
          font-weight: 700;
          color: white;
          background: var(--gradient-primary);
          border: none;
          border-radius: var(--radius-xl);
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: var(--shadow-lg);
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow);
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondary-button {
          padding: var(--spacing-md) var(--spacing-xl);
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--color-text-primary);
          background: var(--color-bg-card);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .secondary-button:hover:not(:disabled) {
          border-color: var(--color-primary);
          background: var(--color-bg-card-hover);
        }

        .secondary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .divider {
          text-align: center;
          color: var(--color-text-muted);
          font-size: var(--font-size-sm);
          position: relative;
        }

        .divider::before,
        .divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background: var(--color-border);
        }

        .divider::before {
          left: 0;
        }

        .divider::after {
          right: 0;
        }

        .join-form {
          display: flex;
          gap: var(--spacing-md);
        }

        .session-input {
          flex: 1;
          padding: var(--spacing-md) var(--spacing-lg);
          font-size: var(--font-size-base);
          color: var(--color-text-primary);
          background: var(--color-bg-card);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .session-input:focus {
          border-color: var(--color-primary);
          outline: none;
        }

        .session-info {
          padding: var(--spacing-lg);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .session-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .session-id-display {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .session-id-display code {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-bg-darker);
          border-radius: var(--radius-md);
          font-family: 'Courier New', monospace;
          font-size: var(--font-size-sm);
          color: var(--color-primary);
        }

        .copy-button {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--font-size-sm);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .copy-button:hover {
          background: var(--color-bg-card-hover);
        }

        .error-message {
          padding: var(--spacing-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--color-error);
          border-radius: var(--radius-lg);
          color: var(--color-error);
          text-align: center;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);
        }

        .feature-card {
          padding: var(--spacing-xl);
          border-radius: var(--radius-xl);
          text-align: center;
        }

        .feature-icon {
          font-size: var(--font-size-5xl);
          margin-bottom: var(--spacing-md);
        }

        .feature-title {
          font-size: var(--font-size-lg);
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .feature-description {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin: 0;
        }

        .game-container {
          width: 100%;
          max-width: 1400px;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: var(--spacing-2xl);
        }

        .game-content {
          display: flex;
          justify-content: center;
        }

        .game-sidebar {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
        }

        .session-card {
          padding: var(--spacing-lg);
          border-radius: var(--radius-xl);
        }

        .session-header {
          font-size: var(--font-size-base);
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-md);
        }

        .session-details {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }

        .detail-value {
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .results-container {
          width: 100%;
          max-width: 600px;
        }

        .results-card {
          padding: var(--spacing-3xl);
          border-radius: var(--radius-2xl);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2xl);
          align-items: center;
        }

        .results-title {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }

        .winner-section {
          text-align: center;
          padding: var(--spacing-2xl);
          background: var(--gradient-primary);
          border-radius: var(--radius-xl);
          width: 100%;
        }

        .winner-crown {
          font-size: var(--font-size-5xl);
          margin-bottom: var(--spacing-md);
          animation: bounce 1s ease-in-out infinite;
        }

        .winner-text {
          font-size: var(--font-size-2xl);
          font-weight: 800;
          color: white;
          margin-bottom: var(--spacing-sm);
        }

        .winner-points {
          font-size: var(--font-size-xl);
          color: rgba(255, 255, 255, 0.9);
          font-family: 'Courier New', monospace;
        }

        @media (max-width: 1024px) {
          .game-container {
            grid-template-columns: 1fr;
          }

          .game-sidebar {
            order: -1;
          }
        }

        @media (max-width: 640px) {
          .app-container {
            padding: var(--spacing-md);
          }

          .app-title {
            font-size: var(--font-size-3xl);
          }

          .landing-card {
            padding: var(--spacing-xl);
          }

          .join-form {
            flex-direction: column;
          }

          .connection-status {
            position: static;
            margin-top: var(--spacing-md);
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
