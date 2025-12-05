'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useGameState } from '../hooks/useGameState';
import { useSessionManager } from '../hooks/useSessionManager';
import { useSoloMode } from '../hooks/useSoloMode';
import { useMultiplayerMode } from '../hooks/useMultiplayerMode';
import { useLiveGames } from '../hooks/useLiveGames';
import { useChat } from '../hooks/useChat';

import { LandingPage } from '../components/landing/LandingPage';
import GameBoard from '../components/GameBoard';
import SessionIdDisplay from '../components/SessionIdDisplay';
import Chat from '../components/Chat';
import { SoloResults } from '../components/SoloResults';
import { TurnTimer } from '../components/TurnTimer';
import { HorseRaceLeaderboard } from '../components/HorseRaceLeaderboard';
import GameControls from '../components/GameControls'; // Keep this for now, as it's not explicitly removed
import { GlobalRanking } from '../components/GlobalRanking'; // Keep this for now, as it's not explicitly removed

import { getLeaderboard, getSession } from '../utils/api';

export default function Home() {
  // --- HUD & Overlay State ---
  const [showNewMatchModal, setShowNewMatchModal] = useState(false);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);
  const [turnEndTime, setTurnEndTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [error, setError] = useState<string | null>(null);

  // --- Core Hooks ---
  const gameState = useGameState();
  const sessionManager = useSessionManager();
  const chat = useChat();

  // Poll live games only when in landing phase
  const liveGames = useLiveGames(gameState.gamePhase === 'landing');

  // --- WebSocket Hook ---
  const ws = useWebSocket();

  // --- Game Mode Hooks ---
  const soloMode = useSoloMode({
    currentRound: gameState.currentRound,
    targetColor: gameState.targetColor,
    singlePlayerScore: gameState.singlePlayerScore,
    setSinglePlayerScore: gameState.setSinglePlayerScore,
    setLeaderboard: gameState.setLeaderboard,
    setWinner: gameState.setWinner,
    setCurrentRound: gameState.setCurrentRound,
    setTargetColor: gameState.setTargetColor,
    setGamePhase: gameState.setGamePhase,
    username: sessionManager.username
  });

  const multiplayerMode = useMultiplayerMode({
    session: sessionManager.session,
    playerId: sessionManager.playerId,
    currentRound: gameState.currentRound,
    targetColor: gameState.targetColor,
    wsSubmitRound: ws.submitRound,
    setCurrentRound: gameState.setCurrentRound,
    setTargetColor: gameState.setTargetColor,
    setGamePhase: gameState.setGamePhase,
  });

  // --- Event Handlers ---

  const handleCreateGame = async () => {
    try {
      const { session, playerId } = await sessionManager.createGame(maxPlayers, gameState.totalRounds);
      ws.joinSession(session.id, playerId);
      gameState.startMultiplayerGame(session.startColor, session.totalRounds || 3);
      chat.clearMessages();
    } catch (err) {
      // Error handled in hook, but maybe we want global error too?
    }
  };

  const handleJoinGame = async () => {
    // This function is for the LandingPage "Join Game" button
    // The ID comes from LandingPage state which is not hoisted directly to a single var here
    // But LandingPage takes joinSessionId prop.
    // In our render below, we pass joinIdInput to LandingPage.
    try {
      await performJoin(joinIdInput, sessionManager.joinPassword);
    } catch (err) { }
  };

  const performJoin = async (id: string, pw?: string) => {
    try {
      const { session, playerId, currentRound } = await sessionManager.joinGame(id, pw);

      ws.joinSession(session.id, playerId);
      gameState.setTargetColor(session.startColor);
      gameState.setCurrentRound(currentRound);
      gameState.setGamePhase('playing');
      chat.clearMessages();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join session');
    }
  };

  const handlePlaySolo = () => {
    sessionManager.generateNewUsername();
    // Generate random start color locally
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const startColor = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

    gameState.startSoloGame(startColor);

    // Create initial leaderboard entry
    gameState.setLeaderboard([{
      playerId: 'solo-player',
      username: sessionManager.username || 'Player',
      bestScore: 0,
      totalScore: 0,
      completedRounds: 0,
      isFinished: false,
      isWaiting: false
    }]);
  };

  const handleSoloSubmitAdapter = (color: { r: number; g: number; b: number }, distance: number, score: number) => {
    soloMode.submitSoloRound(score);
  };

  const handleQuit = () => {
    if (sessionManager.session && sessionManager.playerId && !gameState.isSinglePlayer) {
      ws.quitSession(sessionManager.session.id, sessionManager.playerId);
    }
    gameState.resetGame();
    sessionManager.resetSession();
    chat.clearMessages();
    setError(null);
  };

  const handleRematch = async () => {
    if (sessionManager.session && sessionManager.playerId) {
      ws.requestNewMatch(sessionManager.session.id, sessionManager.playerId);
    }
  };

  const handleVoteNewMatch = (vote: boolean) => {
    if (sessionManager.session && sessionManager.playerId) {
      ws.voteNewMatch(sessionManager.session.id, sessionManager.playerId, vote);
      if (!vote) setShowNewMatchModal(false);
    }
  };

  // --- WebSocket Effects ---
  useEffect(() => {
    const cleanupLeaderboard = ws.onLeaderboardUpdate((data) => {
      gameState.setLeaderboard(data.leaderboard);
      if (data.winner) gameState.setWinner(data.winner);
    });

    const cleanupNextRound = ws.onNextRound((data) => {
      gameState.setCurrentRound(data.roundNumber);
      gameState.setTargetColor(data.targetColor);
      gameState.setGamePhase('playing');
    });

    const cleanupChatMessage = ws.onChatMessage((message) => {
      chat.addMessage(message);
    });

    const cleanupPlayerQuit = ws.onPlayerQuit((data) => {
      gameState.setLeaderboard(prev => prev.filter(entry => entry.playerId !== data.playerId));
    });

    const cleanupSessionsUpdate = ws.onSessionsUpdate(() => {
      if (gameState.gamePhase === 'landing') {
        liveGames.refreshSessions();
      }
    });

    const cleanupPlayerJoined = ws.onPlayerJoined((data) => {
      if (sessionManager.session) {
        // Refresh session to get updated player counts
        getSession(sessionManager.session.id).then(updated => {
          sessionManager.setSession(updated);
          // Leaderboard update should come via onLeaderboardUpdate usually, but we can force fetch
          getLeaderboard(updated.id).then(lb => gameState.setLeaderboard(lb.leaderboard));
        });
      }
    });

    const cleanupError = ws.onError((err) => {
      setError(err.message);
    });

    const cleanupNewMatchRequested = ws.onNewMatchRequested(() => {
      setShowNewMatchModal(true);
    });

    const cleanupNewMatchStarted = ws.onNewMatchStarted((data) => {
      gameState.setCurrentRound(data.roundNumber);
      gameState.setTargetColor(data.targetColor);
      gameState.setGamePhase('playing');
      setShowNewMatchModal(false);
      gameState.setWinner(null);
    });

    const cleanupTurnStarted = ws.onTurnStarted((data) => {
      setCurrentTurnPlayerId(data.currentTurnPlayerId);
      setTurnEndTime(data.turnEndTime);
      gameState.setCurrentRound(data.roundNumber);
    });

    const cleanupStartCountdown = ws.onStartCountdown((data) => {
      setCountdown(data.duration);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    });

    return () => {
      cleanupLeaderboard();
      cleanupNextRound();
      cleanupChatMessage();
      cleanupPlayerQuit();
      cleanupSessionsUpdate();
      cleanupPlayerJoined();
      cleanupError();
      cleanupNewMatchRequested();
      cleanupNewMatchStarted();
      cleanupTurnStarted();
      cleanupStartCountdown();
    };
  }, [ws, gameState, sessionManager, chat, liveGames]);


  // Helper for LandingPage inputs
  // We need to store temporary input state here to pass to sessionManager
  const [joinIdInput, setJoinIdInput] = useState('');

  // --- Render ---

  if (gameState.gamePhase === 'landing') {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title animate-fadeIn">
            <span className="title-gradient">Color Match Challenge</span>
          </h1>
          <p className="app-subtitle animate-fadeIn">
            Test your color perception skills
          </p>
          {ws.isConnected && (
            <div className="connection-status">
              <span className="status-dot" />
              Connected
            </div>
          )}
        </header>

        <main className="app-main">
          <LandingPage
            username={sessionManager.username}
            setUsername={sessionManager.setUsername}
            generateUsername={sessionManager.generateNewUsername}

            maxPlayers={maxPlayers}
            setMaxPlayers={setMaxPlayers}
            totalRounds={gameState.totalRounds}
            setTotalRounds={gameState.setTotalRounds}
            sessionPassword={sessionManager.sessionPassword}
            setSessionPassword={sessionManager.setSessionPassword}
            isCreating={sessionManager.isLoading}
            onCreateGame={handleCreateGame}

            joinSessionId={joinIdInput}
            setJoinSessionId={setJoinIdInput}
            joinPassword={sessionManager.joinPassword}
            setJoinPassword={sessionManager.setJoinPassword}
            isJoining={sessionManager.isLoading}
            onJoinGame={() => performJoin(joinIdInput, sessionManager.joinPassword)}

            onPlaySolo={handlePlaySolo}

            activeSessions={liveGames.activeSessions}
            isLoadingSessions={liveGames.isLoading}
            sessionsError={liveGames.error}
            onJoinFromList={(id, password) => performJoin(id, password)}
            onRefreshSessions={liveGames.refreshSessions}

            error={sessionManager.error || error}
          />
        </main>
      </div>
    );
  }

  // Common Header for Game Modes
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Color Match Challenge</h1>
        {ws.isConnected && (
          <div className="connection-status">
            <span className="status-dot" />
            Connected
          </div>
        )}
      </header>

      <main className="app-main">
        {countdown !== null && (
          <div className="countdown-overlay">
            <div className="countdown-number">{countdown}</div>
          </div>
        )}

        {/* Game Area */}
        {gameState.gamePhase === 'solo_results' ? (
          <SoloResults
            username={sessionManager.username}
            totalScore={gameState.singlePlayerScore}
            completedRounds={8}
            onPlayAgain={handleQuit} // "Quit" resets state correctly
            onGoHome={handleQuit}
          />
        ) : (
          <div className="game-container">
            {gameState.gamePhase === 'waiting' && (
              <div className="waiting-banner animate-slideDown">
                <div className="waiting-banner-content">
                  <span className="waiting-icon-small">⏳</span>
                  <span className="waiting-message">
                    Round complete! Waiting for other players...
                  </span>
                </div>
              </div>
            )}

            <div className="game-content">
              <GameBoard
                targetColor={gameState.targetColor}
                currentRound={gameState.currentRound}
                totalRounds={gameState.isSinglePlayer ? 8 : (sessionManager.session?.totalRounds || 3)}
                onSubmit={gameState.isSinglePlayer ? handleSoloSubmitAdapter : multiplayerMode.submitMultiplayerRound}
                isSubmitting={sessionManager.isLoading} // Reusing loading state?
                disabled={gameState.gamePhase === 'waiting'}
              />
            </div>

            <aside className="game-sidebar">
              {!gameState.isSinglePlayer && sessionManager.session && (
                <>
                  <SessionIdDisplay sessionId={sessionManager.session.id} />

                  <div className="session-card glass">
                    <div className="session-header">Player Info</div>
                    <div className="session-details">
                      <div className="detail-row">
                        <span className="detail-label">You:</span>
                        <span className="detail-value">{sessionManager.username}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Players:</span>
                        <span className="detail-value">{gameState.leaderboard.length}/{maxPlayers}</span>
                      </div>
                      {currentTurnPlayerId && (
                        <div className="detail-row">
                          <span className="detail-label">
                            {currentTurnPlayerId === sessionManager.playerId ? "🎯 Your Turn!" : "Spectating"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {currentTurnPlayerId && turnEndTime && (
                    <TurnTimer
                      endTime={turnEndTime}
                      onTimeout={() => {
                        if (sessionManager.session) {
                          ws.reportTurnTimeout(sessionManager.session.id);
                        }
                      }}
                      isActive={currentTurnPlayerId === sessionManager.playerId}
                    />
                  )}

                  <Chat
                    sessionId={sessionManager.session.id}
                    playerId={sessionManager.playerId || ''}
                    username={sessionManager.username}
                    messages={chat.messages}
                    onSendMessage={(msg) => {
                      if (sessionManager.session && sessionManager.playerId) {
                        ws.sendChatMessage(sessionManager.session.id, sessionManager.playerId, sessionManager.username, msg);
                      }
                    }}
                  />
                </>
              )}

              {!gameState.isSinglePlayer ? (
                <HorseRaceLeaderboard
                  leaderboard={gameState.leaderboard}
                  currentTurnPlayerId={currentTurnPlayerId}
                />
              ) : (
                <HorseRaceLeaderboard
                  leaderboard={gameState.leaderboard}
                  isSoloMode={true}
                  currentScore={gameState.singlePlayerScore}
                  playerName={sessionManager.username}
                />
              )}

              <div className="mt-4">
                <button className="secondary-button w-full" onClick={handleQuit}>
                  {gameState.isSinglePlayer ? "Quit Solo Game" : "Quit Game"}
                </button>
              </div>

              {/* Game Over / Rematch UI */}
              {gameState.winner && !gameState.isSinglePlayer && (
                <GameControls
                  onQuit={handleQuit}
                  onRematch={handleRematch}
                  showRematch={true}
                />
              )}
            </aside>
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--color-bg-card);
          padding: var(--spacing-2xl);
          border-radius: var(--radius-2xl);
          border: 1px solid var(--color-border);
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: var(--shadow-2xl);
        }

        .modal-title {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          margin-bottom: var(--spacing-md);
          color: var(--color-text-primary);
        }

        .modal-text {
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-xl);
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
        }

        .modal-btn {
          padding: var(--spacing-md) var(--spacing-lg);
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          border: none;
        }

        .modal-btn.confirm {
          background: var(--color-success);
          color: white;
        }

        .modal-btn.confirm:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .modal-btn.cancel {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }

        .modal-btn.cancel:hover {
          background: var(--color-border);
          transform: translateY(-2px);
        }

        .countdown-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        .countdown-number {
          font-size: 120px;
          font-weight: 900;
          color: var(--color-primary);
          text-shadow: 0 0 40px var(--color-primary);
          animation: countdownPulse 1s ease infinite;
        }

        @keyframes countdownPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .game-settings {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .setting-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .setting-group label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .number-input {
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          color: var(--color-text-primary);
          font-size: var(--font-size-md);
          font-family: var(--font-mono);
          text-align: center;
        }

        .number-input:focus {
          outline: none;
          border-color: var(--color-primary);
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

        .solo-button {
          padding: var(--spacing-lg) var(--spacing-2xl);
          font-size: var(--font-size-lg);
          font-weight: 700;
          color: var(--color-primary);
          background: white;
          border: 2px solid var(--color-primary);
          border-radius: var(--radius-xl);
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: var(--shadow-md);
        }

        .solo-button:hover:not(:disabled) {
          background: var(--color-bg-card-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .solo-button:disabled {
          opacity: 0.6;
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

        .waiting-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(147, 51, 234, 0.95));
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .waiting-banner-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          color: white;
        }

        .waiting-icon-small {
          font-size: var(--font-size-xl);
          animation: pulse 2s ease-in-out infinite;
        }

        .waiting-message {
          font-size: var(--font-size-base);
          font-weight: 600;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .waiting-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .waiting-card {
          max-width: 600px;
          width: 100%;
          padding: var(--spacing-3xl);
          text-align: center;
        }

        .waiting-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-lg);
          animation: pulse 2s ease-in-out infinite;
        }

        .waiting-title {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          margin: 0 0 var(--spacing-md) 0;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .waiting-text {
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-xl);
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

        /* New Styles */
        .username-section {
          margin-bottom: var(--spacing-md);
        }

        .input-group {
          display: flex;
          gap: var(--spacing-sm);
        }

        .text-input {
          flex: 1;
          padding: var(--spacing-md) var(--spacing-lg);
          font-size: var(--font-size-base);
          color: var(--color-text-primary);
          background: var(--color-bg-card);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .text-input:focus {
          border-color: var(--color-primary);
          outline: none;
        }

        .icon-button {
          padding: var(--spacing-md);
          font-size: var(--font-size-xl);
          background: var(--color-bg-card);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .icon-button:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-primary);
        }

        .create-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .password-toggle {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .password-toggle label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
        }

        .password-input {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
          background: var(--color-bg-darker);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .password-input:focus {
          border-color: var(--color-primary);
          outline: none;
        }

        .join-inputs {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .join-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      `}</style>
    </div >
  );
}
