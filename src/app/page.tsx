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
import { generateRandomUsername } from '../utils/usernameGenerator';
import SessionIdDisplay from '../components/SessionIdDisplay';
import Chat from '../components/Chat';
import GameControls from '../components/GameControls';
import { ChatMessage, ActiveSession, getActiveSessions, getLeaderboard, getChatHistory, saveSoloGame } from '../utils/api';
import LiveGamesList from '../components/LiveGamesList';
import { SoloResults } from '../components/SoloResults';
import { TurnTimer } from '../components/TurnTimer';
import { HorseRaceLeaderboard } from '../components/HorseRaceLeaderboard';
import { GlobalRanking } from '../components/GlobalRanking';
import { LiveSoloRace } from '../components/LiveSoloRace';

type GamePhase = 'landing' | 'playing' | 'waiting' | 'solo_results';

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
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);
  const [singlePlayerScore, setSinglePlayerScore] = useState(0);

  // New state for features
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sessionPassword, setSessionPassword] = useState('');
  const [showNewMatchModal, setShowNewMatchModal] = useState(false);

  // Turn-based state
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);
  const [turnEndTime, setTurnEndTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [totalRounds, setTotalRounds] = useState(3);

  // Live games state
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const {
    isConnected,
    joinSession: wsJoinSession,
    submitRound: wsSubmitRound,
    onLeaderboardUpdate,
    onPlayerJoined,
    onSessionComplete,
    onNextRound,
    onChatMessage,
    onPlayerQuit,
    onSessionsUpdate,
    onError,
    sendChatMessage,
    quitSession,
    requestNewMatch,
    voteNewMatch,
    onNewMatchRequested,
    onNewMatchStarted,
    onTurnStarted,
    onStartCountdown,
    reportTurnTimeout
  } = useWebSocket();

  // Set up WebSocket event listeners
  useEffect(() => {
    const cleanupLeaderboard = onLeaderboardUpdate((data) => {
      setLeaderboard(data.leaderboard);
      if (data.winner) {
        setWinner(data.winner);
      }
    });



    const cleanupSessionComplete = onSessionComplete((data) => {
      // In continuous mode, session_complete is not used
      console.log('Session complete (legacy event):', data);
    });

    const cleanupNextRound = onNextRound((data) => {
      // Auto-advance to next round
      setCurrentRound(data.roundNumber);
      setTargetColor(data.targetColor);
      setGamePhase('playing');
    });

    const cleanupChatMessage = onChatMessage((message) => {
      setChatMessages(prev => [...prev, message]);
    });

    const cleanupPlayerQuit = onPlayerQuit((data) => {
      console.log('Player quit:', data);
      // Remove player from leaderboard to prevent ghost players
      setLeaderboard(prev => prev.filter(entry => entry.playerId !== data.playerId));
    });

    const cleanupSessionsUpdate = onSessionsUpdate(() => {
      // Refresh active sessions when notified
      if (gamePhase === 'landing') {
        getActiveSessions().then(setActiveSessions).catch(console.error);
      }
    });

    const cleanupPlayerJoined = onPlayerJoined((data) => {
      console.log('Player joined:', data);
      // Refresh session data to update player count and list
      if (session) {
        getSession(session.id).then(updatedSession => {
          setSession(updatedSession);
          // Also refresh leaderboard to show new player
          getLeaderboard(session.id).then(data => setLeaderboard(data.leaderboard)).catch(console.error);
        }).catch(console.error);
      }
    });

    const cleanupError = onError((error) => {
      setError(error.message);
    });

    const cleanupNewMatchRequested = onNewMatchRequested((data) => {
      setShowNewMatchModal(true);
    });

    const cleanupNewMatchStarted = onNewMatchStarted((data) => {
      setCurrentRound(data.roundNumber);
      setTargetColor(data.targetColor);
      setGamePhase('playing');
      setShowNewMatchModal(false);
      setWinner(null);
    });

    const cleanupTurnStarted = onTurnStarted((data) => {
      setCurrentTurnPlayerId(data.currentTurnPlayerId);
      setTurnEndTime(data.turnEndTime);
      setCurrentRound(data.roundNumber);
    });

    const cleanupStartCountdown = onStartCountdown((data) => {
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
      cleanupPlayerJoined();
      cleanupSessionComplete();
      cleanupNextRound();
      cleanupChatMessage();
      cleanupPlayerQuit();
      cleanupSessionsUpdate();
      cleanupError();
      cleanupNewMatchRequested();
      cleanupNewMatchStarted();
      cleanupTurnStarted();
      cleanupStartCountdown();
    };
  }, [onLeaderboardUpdate, onPlayerJoined, onSessionComplete, onNextRound, onChatMessage, onPlayerQuit, onSessionsUpdate, onError, onNewMatchRequested, onNewMatchStarted, onTurnStarted, onStartCountdown]);

  // Poll for active sessions on landing page
  useEffect(() => {
    if (gamePhase !== 'landing') return;

    const fetchSessions = async () => {
      try {
        // Only show loading on first fetch if we have no sessions
        if (activeSessions.length === 0 && !isLoadingSessions) {
          // We can skip setting loading true for background polls to avoid flicker
          // or we can use a separate 'isFirstLoad' state. 
          // But simpler: just don't set isLoadingSessions(true) here if we want to avoid the spinner.
          // However, for the very first load, we might want it.
          // Let's just remove the setIsLoadingSessions(true) from the interval calls?
          // Or better: check if it's the first run.
        }

        const sessions = await getActiveSessions();
        setActiveSessions(sessions);
        setSessionsError(null);
      } catch (err) {
        console.error('Failed to fetch active sessions:', err);
        setSessionsError(err instanceof Error ? err.message : 'Failed to load games');
      } finally {
        setIsLoadingSessions(false);
      }
    };

    // Initial fetch with loading state
    setIsLoadingSessions(true);
    fetchSessions();

    const interval = setInterval(async () => {
      const sessions = await getActiveSessions();
      setActiveSessions(sessions);
    }, 2000);

    return () => clearInterval(interval);
  }, [gamePhase]);



  // Poll for game state during gameplay (fallback/sync)
  useEffect(() => {
    if (gamePhase !== 'playing' || !session || isSinglePlayer) return;

    const fetchGameState = async () => {
      try {
        // Fetch leaderboard
        const leaderboardData = await getLeaderboard(session.id);
        setLeaderboard(leaderboardData.leaderboard);
        if (leaderboardData.winner) {
          setWinner(leaderboardData.winner);
        }

        // Fetch chat history (optional, to ensure sync)
        const history = await getChatHistory(session.id, 50);
        // We don't want to overwrite local state if we have more messages, 
        // but this helps if we missed some. 
        // For simplicity, we'll rely on WS for chat mostly, but this could be used to backfill.
      } catch (err) {
        console.error('Failed to sync game state:', err);
      }
    };

    const interval = setInterval(fetchGameState, 5000);

    return () => clearInterval(interval);
  }, [gamePhase, session, isSinglePlayer]);

  const handleCreateSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate and constrain input values
      const validMaxPlayers = typeof maxPlayers === 'number' ? Math.min(20, Math.max(2, maxPlayers)) : 4;
      const validTotalRounds = typeof totalRounds === 'number' ? Math.min(10, Math.max(1, totalRounds)) : 3;

      // Create session with password if provided
      const newSession = await createSession(undefined, undefined, sessionPassword || undefined, validMaxPlayers, validTotalRounds);
      setSession(newSession);

      // Use provided username or generate random one
      const finalUsername = username || generateRandomUsername();
      setUsername(finalUsername);

      // Join the session
      const joinResponse = await joinSession(newSession.id, finalUsername, sessionPassword || undefined);
      setPlayerId(joinResponse.playerId);

      // Join WebSocket room
      wsJoinSession(newSession.id, joinResponse.playerId);

      // Set target color for first round
      setTargetColor(newSession.startColor);
      setCurrentRound(1);
      setGamePhase('playing');
      setChatMessages([]);
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

      // Use provided username or generate random one
      const finalUsername = username || generateRandomUsername();
      setUsername(finalUsername);

      // Join the session
      const joinResponse = await joinSession(joinSessionId, finalUsername, password || undefined);
      setPlayerId(joinResponse.playerId);
      setCurrentRound(joinResponse.currentRound);

      // Join WebSocket room
      wsJoinSession(joinSessionId, joinResponse.playerId);

      // Set target color
      setTargetColor(existingSession.startColor);
      setGamePhase('playing');
      setChatMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaySolo = () => {
    setIsSinglePlayer(true);
    setPlayerId('solo-player');

    // Use provided username or generate random one
    const finalUsername = username || generateRandomUsername();
    setUsername(finalUsername);

    // Generate random start color
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const startColor = rgbToHex(r, g, b);

    setTargetColor(startColor);
    setCurrentRound(1);
    setSinglePlayerScore(0);
    setGamePhase('playing');

    // Create initial leaderboard entry for solo player
    setLeaderboard([{
      playerId: 'solo-player',
      username: finalUsername,
      bestScore: 0,
      totalScore: 0,
      completedRounds: 0,
      isFinished: false,
      isWaiting: false
    }]);
  };

  const handleSubmitRound = async (
    selectedColor: { r: number; g: number; b: number },
    distance: number,
    score: number
  ) => {
    if (!playerId) return;

    try {
      setIsLoading(true);

      if (isSinglePlayer) {
        // Handle single player logic
        const newTotalScore = singlePlayerScore + score;
        setSinglePlayerScore(newTotalScore);

        // Update leaderboard
        setLeaderboard([{
          playerId: 'solo-player',
          username: 'You',
          bestScore: score,
          totalScore: newTotalScore,
          completedRounds: currentRound,
          isFinished: currentRound >= 8,
          isWaiting: false
        }]);

        setWinner({
          playerId: 'solo-player',
          username: 'You',
          bestScore: score,
          totalScore: newTotalScore,
          completedRounds: currentRound,
          isFinished: true,
          isWaiting: false
        });

        // Check if game is complete (8 rounds)
        if (currentRound >= 8) {
          // Transition immediately to results, saving happens in SoloResults component
          setGamePhase('solo_results');
        } else {
          setCurrentRound(currentRound + 1);
          const newTargetColor = generateDistinctColor(targetColor, 50);
          setTargetColor(newTargetColor);
        }
      } else {
        // Handle multiplayer logic
        if (!session) return;

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
        if (currentRound < (session?.totalRounds || 3)) {
          setCurrentRound(currentRound + 1);
          // Generate new target color that's significantly different from current
          const newTargetColor = generateDistinctColor(targetColor, 50);
          setTargetColor(newTargetColor);
        } else {
          // In continuous mode, move to waiting state
          setGamePhase('waiting');
        }
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
    // Keep username
    setCurrentRound(1);
    setLeaderboard([]);
    setWinner(null);
    setError(null);
    setIsSinglePlayer(false);
    setSinglePlayerScore(0);
    setChatMessages([]);
    setPassword('');
    setSessionPassword('');
  };

  const handleQuit = () => {
    if (session && playerId && !isSinglePlayer) {
      quitSession(session.id, playerId);
    }
    handlePlayAgain();
  };

  const handleRematch = async () => {
    if (session && playerId) {
      requestNewMatch(session.id, playerId);
    }
  };

  const handleVoteNewMatch = (vote: boolean) => {
    if (session && playerId) {
      voteNewMatch(session.id, playerId, vote);
      if (!vote) {
        setShowNewMatchModal(false);
      }
    }
  };

  const handleSendMessage = (message: string) => {
    if (session && playerId && username) {
      sendChatMessage(session.id, playerId, username, message);
    }
  };

  const generateUsername = () => {
    setUsername(generateRandomUsername());
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
          <div className="min-h-screen bg-[var(--bg-secondary)] p-4 md:p-8">
            <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

              {/* LEFT COLUMN: Hero & Actions */}
              <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-8">
                {/* Brand / Hero */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] font-bold text-xl">
                      C
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                      Color Match
                    </h1>
                  </div>
                  <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                    Test your color perception. Match the target color as closely as possible. Compete in real-time or practice solo.
                  </p>
                </div>

                {/* Main Action Card */}
                <div className="surface-card p-6 space-y-6">
                  {/* Username Section */}
                  <div className="space-y-2">
                    <label className="text-caption font-medium uppercase tracking-wider">Your Name</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[var(--radius-sm)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
                      />
                      <button
                        onClick={generateUsername}
                        className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[var(--radius-sm)] hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
                        title="Generate Random Name"
                      >
                        🎲
                      </button>
                    </div>
                  </div>

                  <hr className="border-[var(--border-primary)]" />

                  {/* Create Game Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-body font-semibold">Create New Game</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-caption">Max Players</label>
                        <input
                          type="number"
                          min="2"
                          max="20"
                          value={maxPlayers}
                          onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 2)}
                          className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[var(--radius-sm)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-caption">Rounds</label>
                        <input
                          type="number"
                          min="1"
                          value={totalRounds}
                          onChange={(e) => setTotalRounds(parseInt(e.target.value) || 3)}
                          className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[var(--radius-sm)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="password-protect"
                        checked={!!sessionPassword}
                        onChange={(e) => setSessionPassword(e.target.checked ? '1234' : '')}
                        className="rounded border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-0"
                      />
                      <label htmlFor="password-protect" className="text-sm text-[var(--text-secondary)] select-none cursor-pointer">
                        Password protect
                      </label>
                    </div>

                    {sessionPassword && (
                      <input
                        type="text"
                        placeholder="Set Password"
                        value={sessionPassword}
                        onChange={(e) => setSessionPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[var(--radius-sm)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                      />
                    )}

                    <button
                      onClick={handleCreateSession}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Create Session'}
                    </button>
                  </div>

                  <hr className="border-[var(--border-primary)]" />

                  {/* Join Game Section */}
                  <div className="space-y-3">
                    <h3 className="text-body font-semibold">Join Existing</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Session ID"
                        value={joinSessionId}
                        onChange={(e) => setJoinSessionId(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[var(--radius-sm)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                      />
                      <button
                        onClick={handleJoinSession}
                        disabled={isLoading || !joinSessionId}
                        className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium rounded-[var(--radius-sm)] hover:bg-[var(--border-secondary)] transition-colors disabled:opacity-50"
                      >
                        Join
                      </button>
                    </div>
                    {showPasswordInput && (
                      <input
                        type="password"
                        placeholder="Session Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[var(--radius-sm)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                      />
                    )}
                    <button
                      onClick={() => setShowPasswordInput(!showPasswordInput)}
                      className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline decoration-dotted"
                    >
                      {showPasswordInput ? "Hide Password" : "Have a password?"}
                    </button>
                  </div>

                  <hr className="border-[var(--border-primary)]" />

                  {/* Solo Mode */}
                  <div>
                    <button
                      onClick={handlePlaySolo}
                      disabled={isLoading}
                      className="w-full py-2.5 border border-[var(--border-primary)] text-[var(--text-primary)] font-medium rounded-[var(--radius-sm)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center gap-2"
                    >
                      <span>👤</span> Play Solo Mode
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 bg-[var(--accent-error-bg)] text-[var(--accent-error)] text-sm rounded-[var(--radius-sm)]">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Live Content */}
              <div className="lg:col-span-7 space-y-8">
                <LiveGamesList
                  sessions={activeSessions}
                  onJoin={async (sessionId, password) => {
                    try {
                      setIsLoading(true);
                      setError(null);
                      const existingSession = await getSession(sessionId);
                      setSession(existingSession);
                      const finalUsername = username || generateRandomUsername();
                      setUsername(finalUsername);
                      const joinResponse = await joinSession(sessionId, finalUsername, password);
                      setPlayerId(joinResponse.playerId);
                      setCurrentRound(joinResponse.currentRound);
                      wsJoinSession(sessionId, joinResponse.playerId);
                      setTargetColor(existingSession.startColor);
                      setGamePhase('playing');
                      setChatMessages([]);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to join session');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  onRefresh={() => {
                    setIsLoadingSessions(true);
                    getActiveSessions()
                      .then((s) => {
                        setActiveSessions(s);
                        setSessionsError(null);
                      })
                      .catch((e) => setSessionsError(e instanceof Error ? e.message : 'Failed to refresh'))
                      .finally(() => setIsLoadingSessions(false));
                  }}
                  isLoading={isLoadingSessions}
                  error={sessionsError}
                />

                <GlobalRanking />
              </div>

            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="countdown-overlay">
            <div className="countdown-number">{countdown}</div>
          </div>
        )}

        {/* Playing or Waiting Phase */}
        {(gamePhase === 'playing' || gamePhase === 'waiting') && playerId && (
          <div className="game-container">
            {/* Waiting Banner - shown when player finished but others haven't */}
            {gamePhase === 'waiting' && (
              <div className="waiting-banner animate-slideDown">
                <div className="waiting-banner-content">
                  <span className="waiting-icon-small">⏳</span>
                  <span className="waiting-message">
                    Round complete! Waiting for other players to finish...
                  </span>
                </div>
              </div>
            )}

            <div className="game-content">
              <GameBoard
                targetColor={targetColor}
                currentRound={currentRound}
                totalRounds={isSinglePlayer ? 8 : (session?.totalRounds || 3)}
                onSubmit={handleSubmitRound}
                isSubmitting={isLoading}
                disabled={gamePhase === 'waiting'}
              />
            </div>

            <aside className="game-sidebar">
              {!isSinglePlayer && session && (
                <>
                  <SessionIdDisplay sessionId={session.id} />

                  <div className="session-card glass">
                    <div className="session-header">Player Info</div>
                    <div className="session-details">
                      <div className="detail-row">
                        <span className="detail-label">You:</span>
                        <span className="detail-value">{username}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Players:</span>
                        <span className="detail-value">{leaderboard.length}/{maxPlayers}</span>
                      </div>
                      {currentTurnPlayerId && (
                        <div className="detail-row">
                          <span className="detail-label">
                            {currentTurnPlayerId === playerId ? "🎯 Your Turn!" : "Spectating"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {currentTurnPlayerId && turnEndTime && (
                    <TurnTimer
                      endTime={turnEndTime}
                      onTimeout={() => {
                        if (session) {
                          reportTurnTimeout(session.id);
                        }
                      }}
                      isActive={currentTurnPlayerId === playerId}
                    />
                  )}

                  <Chat
                    sessionId={session.id}
                    playerId={playerId}
                    username={username}
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                  />
                </>
              )}

              {!isSinglePlayer ? (
                <HorseRaceLeaderboard
                  leaderboard={leaderboard}
                  currentTurnPlayerId={currentTurnPlayerId}
                />
              ) : (
                <>
                  <Leaderboard
                    entries={leaderboard}
                    currentPlayerId={playerId}
                    winner={winner}
                    totalRounds={8}
                  />
                  <LiveSoloRace
                    currentScore={singlePlayerScore}
                    playerName={username}
                  />
                </>
              )}

              <GameControls
                onQuit={handleQuit}
                onRematch={handleRematch}
                showRematch={!!winner}
              />
            </aside>
          </div>
        )}

        {/* Solo Results Phase */}
        {gamePhase === 'solo_results' && (
          <SoloResults
            username={username}
            totalScore={singlePlayerScore}
            completedRounds={8}
            onPlayAgain={() => {
              setGamePhase('landing');
              setSinglePlayerScore(0);
              setCurrentRound(1);
              setLeaderboard([]);
            }}
            onGoHome={() => {
              setGamePhase('landing');
              setSinglePlayerScore(0);
              setCurrentRound(1);
              setLeaderboard([]);
              setIsSinglePlayer(false);
            }}
          />
        )}
        {/* New Match Modal */}
        {showNewMatchModal && (
          <div className="modal-overlay animate-fadeIn">
            <div className="modal-content glass">
              <h3 className="modal-title">New Match Requested</h3>
              <p className="modal-text">
                A player has requested to start a new match. Do you want to join?
              </p>
              <div className="modal-actions">
                <button
                  className="modal-btn confirm"
                  onClick={() => handleVoteNewMatch(true)}
                >
                  ✅ Yes, Let's Play!
                </button>
                <button
                  className="modal-btn cancel"
                  onClick={() => handleVoteNewMatch(false)}
                >
                  ❌ No, Thanks
                </button>
              </div>
            </div>
          </div>
        )}
      </main >

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
