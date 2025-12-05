import React from 'react';

interface CreateGameFormProps {
    maxPlayers: number;
    setMaxPlayers: (n: number) => void;
    totalRounds: number;
    setTotalRounds: (n: number) => void;
    sessionPassword: string;
    setSessionPassword: (s: string) => void;
    isLoading: boolean;
    onCreateGame: () => void;
}

export function CreateGameForm({
    maxPlayers,
    setMaxPlayers,
    totalRounds,
    setTotalRounds,
    sessionPassword,
    setSessionPassword,
    isLoading,
    onCreateGame
}: CreateGameFormProps) {
    return (
        <div className="create-section">
            <div className="game-settings">
                <div className="setting-group">
                    <label>Max Players (2-20)</label>
                    <input
                        type="number"
                        min="2"
                        max="20"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 2)}
                        onFocus={(e) => e.target.select()}
                        className="number-input"
                    />
                </div>
                <div className="setting-group">
                    <label>Total Rounds</label>
                    <input
                        type="number"
                        min="1"
                        value={totalRounds}
                        onChange={(e) => setTotalRounds(parseInt(e.target.value) || 3)}
                        onFocus={(e) => e.target.select()}
                        className="number-input"
                    />
                </div>
            </div>
            <div className="password-toggle">
                <label>
                    <input
                        type="checkbox"
                        checked={!!sessionPassword}
                        onChange={(e) => setSessionPassword(e.target.checked ? '1234' : '')}
                    />
                    Protect with password
                </label>
                {sessionPassword && (
                    <input
                        type="text"
                        placeholder="Set Password"
                        value={sessionPassword}
                        onChange={(e) => setSessionPassword(e.target.value)}
                        className="password-input"
                    />
                )}
            </div>
            <button
                className="primary-button"
                onClick={onCreateGame}
                disabled={isLoading}
            >
                {isLoading ? 'Creating...' : 'Create New Game'}
            </button>
        </div>
    );
}
