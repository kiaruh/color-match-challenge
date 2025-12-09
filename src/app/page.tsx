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

    </div >
  );
}
