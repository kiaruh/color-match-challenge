import React from 'react';
import { CreateGameForm } from './CreateGameForm';
import { JoinGameForm } from './JoinGameForm';
import { FeatureCards } from './FeatureCards';
import LiveGamesList from '../LiveGamesList';
import { GlobalRanking } from '../GlobalRanking';
import { ActiveSession } from '../../utils/api';

interface LandingPageProps {
    username: string;
    setUsername: (name: string) => void;
    generateUsername: () => void;

    maxPlayers: number;
    setMaxPlayers: (n: number) => void;
    totalRounds: number;
    setTotalRounds: (n: number) => void;
    sessionPassword: string;
    setSessionPassword: (s: string) => void;
    isCreating: boolean;
    onCreateGame: () => void;

    joinSessionId: string;
    setJoinSessionId: (id: string) => void;
    joinPassword?: string;
    setJoinPassword?: (pw: string) => void;
    isJoining: boolean;
    onJoinGame: () => void;

    onPlaySolo: () => void;

    activeSessions: ActiveSession[];
    isLoadingSessions: boolean;
    sessionsError: string | null;
    onJoinFromList: (id: string, pw?: string) => void;
    onRefreshSessions: () => void;

    error?: string | null;
}

export function LandingPage({
    username,
    setUsername,
    generateUsername,

    maxPlayers,
    setMaxPlayers,
    totalRounds,
    setTotalRounds,
    sessionPassword,
    setSessionPassword,
    isCreating,
    onCreateGame,

    joinSessionId,
    setJoinSessionId,
    joinPassword,
    setJoinPassword,
    isJoining,
    onJoinGame,

    onPlaySolo,

    activeSessions,
    isLoadingSessions,
    sessionsError,
    onJoinFromList,
    onRefreshSessions,

    error
}: LandingPageProps) {
    return (
        <div className="landing-container animate-scaleIn">
            <div className="landing-card glass">
                <h2 className="landing-title">Ready to Play?</h2>
                <p className="landing-description">
                    Match colors as closely as possible across 3 rounds. Compete with others in real-time!
                </p>

                <div className="username-section">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Enter Username (optional)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="text-input"
                        />
                        <button
                            className="icon-button"
                            onClick={generateUsername}
                            title="Generate Random Name"
                        >
                            🎲
                        </button>
                    </div>
                </div>

                <div className="action-buttons">
                    <CreateGameForm
                        maxPlayers={maxPlayers}
                        setMaxPlayers={setMaxPlayers}
                        totalRounds={totalRounds}
                        setTotalRounds={setTotalRounds}
                        sessionPassword={sessionPassword}
                        setSessionPassword={setSessionPassword}
                        isLoading={isCreating}
                        onCreateGame={onCreateGame}
                    />

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <JoinGameForm
                        sessionId={joinSessionId}
                        setSessionId={setJoinSessionId}
                        password={joinPassword}
                        setPassword={setJoinPassword}
                        isLoading={isJoining}
                        onJoinGame={onJoinGame}
                    />

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <button
                        className="solo-button"
                        onClick={onPlaySolo}
                        disabled={isCreating || isJoining}
                    >
                        Play Solo Mode
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}
            </div>

            <LiveGamesList
                sessions={activeSessions}
                onJoin={onJoinFromList}
                onRefresh={onRefreshSessions}
                isLoading={isLoadingSessions}
                error={sessionsError}
            />

            <FeatureCards />

            <GlobalRanking />
        </div>
    );
}
