'use client';

import { useState } from 'react';

interface SessionIdDisplayProps {
  sessionId: string;
}

export default function SessionIdDisplay({ sessionId }: SessionIdDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="session-id-display">
      <div className="session-label">Session ID</div>
      <div className="session-id-container">
        <code className="session-id">{sessionId}</code>
        <button
          className="copy-btn"
          onClick={handleCopy}
          title="Copy full session ID"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>

      <style jsx>{`
        .session-id-display {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .session-label {
          font-size: var(--font-size-xs);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
        }

        .session-id-container {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .session-id {
          flex: 1;
          font-family: 'Courier New', monospace;
          font-size: var(--font-size-base);
          color: var(--color-primary);
          background: var(--color-bg-darker);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
        }

        .copy-btn {
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-bg-card-hover);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          font-size: var(--font-size-base);
        }

        .copy-btn:hover {
          background: var(--color-primary);
          color: white;
          transform: scale(1.05);
        }

        .copy-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
