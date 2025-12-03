import React, { useEffect, useState } from 'react';

interface TurnTimerProps {
    endTime: string;
    onTimeout: () => void;
    isActive: boolean;
}

export const TurnTimer: React.FC<TurnTimerProps> = ({ endTime, onTimeout, isActive }) => {
    const [timeLeft, setTimeLeft] = useState(40);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const diff = Math.max(0, Math.ceil((end - now) / 1000));

            setTimeLeft(diff);

            if (diff <= 0) {
                clearInterval(interval);
                onTimeout();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime, onTimeout, isActive]);

    const progress = (timeLeft / 40) * 100;
    const color = timeLeft < 10 ? 'var(--color-error)' : 'var(--color-primary)';

    return (
        <div className="turn-timer">
            <div className="timer-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                    <path
                        className="circle-bg"
                        d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className="circle"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
                        style={{ stroke: color }}
                    />
                    <text x="18" y="20.35" className="percentage">{timeLeft}s</text>
                </svg>
            </div>
            <style jsx>{`
        .turn-timer {
          width: 80px;
          height: 80px;
          margin: 0 auto;
        }
        .circular-chart {
          display: block;
          margin: 10px auto;
          max-width: 80%;
          max-height: 250px;
        }
        .circle-bg {
          fill: none;
          stroke: var(--color-bg-secondary);
          stroke-width: 3.8;
        }
        .circle {
          fill: none;
          stroke-width: 2.8;
          stroke-linecap: round;
          transition: stroke-dasharray 1s ease, stroke 0.5s ease;
        }
        .percentage {
          fill: var(--color-text-primary);
          font-family: var(--font-sans);
          font-weight: bold;
          font-size: 0.5em;
          text-anchor: middle;
        }
      `}</style>
        </div>
    );
};
