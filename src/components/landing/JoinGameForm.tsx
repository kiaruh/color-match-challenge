import React, { useState } from 'react';

interface JoinGameFormProps {
    sessionId: string;
    setSessionId: (id: string) => void;
    password?: string;
    setPassword?: (pw: string) => void;
    isLoading: boolean;
    onJoinGame: () => void;
}

export function JoinGameForm({
    sessionId,
    setSessionId,
    password = '',
    setPassword,
    isLoading,
    onJoinGame
}: JoinGameFormProps) {
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    return (
        <div className="join-form">
            <div className="join-inputs">
                <input
                    type="text"
                    placeholder="Enter Session ID"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="session-input"
                />
                {showPasswordInput && setPassword && (
                    <input
                        type="password"
                        placeholder="Session Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="password-input"
                    />
                )}
            </div>
            <div className="join-actions">
                {setPassword && (
                    <button
                        className="icon-button"
                        onClick={() => setShowPasswordInput(!showPasswordInput)}
                        title={showPasswordInput ? "Hide Password" : "Add Password"}
                    >
                        🔒
                    </button>
                )}
                <button
                    className="secondary-button"
                    onClick={onJoinGame}
                    disabled={isLoading || !sessionId}
                >
                    Join Game
                </button>
            </div>
        </div>
    );
}
