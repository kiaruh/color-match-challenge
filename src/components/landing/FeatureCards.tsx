import React from 'react';

export function FeatureCards() {
    return (
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
                <h3 className="feature-title">Turn-Based Multiplayer</h3>
                <p className="feature-description">
                    Take turns competing with others in a horse race to the finish!
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
    );
}
