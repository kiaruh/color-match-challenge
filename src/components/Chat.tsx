'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../utils/api';
import { soundManager } from '../utils/soundManager';

interface ChatProps {
  sessionId: string;
  playerId: string;
  username: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

const EMOJIS = [
  '😀', '😂', '😍', '😎', '🤔', '👍', '👎', '🎉', '🔥', '💯',
  '🎨', '🌈', '✨', '👋', '🤝', '🏆', '👑', '💪', '👀', '👻'
];

export default function Chat({ sessionId, playerId, username, messages, onSendMessage }: ChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  // Play notification sound when new messages arrive (but not on initial load)
  useEffect(() => {
    if (messages.length > prevMessagesLength.current && prevMessagesLength.current > 0) {
      const lastMessage = messages[messages.length - 1];
      // Don't play sound for own messages
      if (lastMessage.playerId !== playerId && !isMuted) {
        soundManager.playChatNotification();
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, playerId, isMuted]);

  // Update sound manager mute state
  useEffect(() => {
    soundManager.setMuted(isMuted);
  }, [isMuted]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    onSendMessage(newMessage);
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  return (
    <div className="chat-container glass">
      <div className="chat-header">
        <h3>Live Chat</h3>
        <div className="header-controls">
          <button
            className="mute-btn"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {isMuted ? '🔇' : '🔔'}
          </button>
          <span className="online-indicator">● Live</span>
        </div>
      </div>

      <div className="messages-list">
        {messages.length === 0 && (
          <div className="empty-chat">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.playerId === playerId;
          return (
            <div key={msg.id} className={`message-row ${isMe ? 'me' : 'other'}`}>
              {!isMe && <div className="message-sender">{msg.username}</div>}
              <div className="message-bubble">
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <div className="input-wrapper">
          <button
            type="button"
            className="emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>

          {showEmojiPicker && (
            <div className="emoji-picker animate-fadeIn">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className="emoji-option"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
          />
        </div>

        <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 400px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-primary);
          border: 1px solid var(--border-primary);
        }

        .chat-header {
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--border-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-secondary);
        }

        .chat-header h3 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .mute-btn {
          background: none;
          border: none;
          font-size: 1.125rem;
          cursor: pointer;
          padding: var(--spacing-xs);
          transition: transform var(--transition-fast);
        }

        .mute-btn:hover {
          transform: scale(1.05);
        }

        .online-indicator {
          font-size: 0.75rem;
          color: var(--accent-success);
          animation: pulse 2s infinite;
        }

        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .empty-chat {
          text-align: center;
          color: var(--text-secondary);
          margin-top: var(--spacing-xl);
          font-size: 0.875rem;
        }

        .message-row {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .message-row.me {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message-row.other {
          align-self: flex-start;
          align-items: flex-start;
        }

        .message-sender {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 2px;
          margin-left: var(--spacing-xs);
        }

        .message-bubble {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          line-height: 1.4;
          word-break: break-word;
        }

        .message-row.me .message-bubble {
          background: var(--accent-primary);
          color: white;
          border-bottom-right-radius: 2px;
        }

        .message-row.other .message-bubble {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
          border-bottom-left-radius: 2px;
        }

        .chat-input-area {
          padding: var(--spacing-md);
          border-top: 1px solid var(--border-primary);
          display: flex;
          gap: var(--spacing-sm);
          background: var(--bg-secondary);
        }

        .input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-primary);
          border-radius: var(--radius-full);
          padding: 2px;
          border: 1px solid var(--border-primary);
        }

        .emoji-btn {
          padding: var(--spacing-xs) var(--spacing-sm);
          background: none;
          border: none;
          font-size: 1.125rem;
          cursor: pointer;
          transition: transform var(--transition-fast);
        }

        .emoji-btn:hover {
          transform: scale(1.05);
        }

        .emoji-picker {
          position: absolute;
          bottom: 100%;
          left: 0;
          margin-bottom: var(--spacing-sm);
          background: var(--bg-primary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          padding: var(--spacing-sm);
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--spacing-xs);
          box-shadow: var(--shadow-md);
          z-index: 10;
          width: 200px;
        }

        .emoji-option {
          background: none;
          border: none;
          font-size: 1.125rem;
          cursor: pointer;
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
        }

        .emoji-option:hover {
          background: var(--bg-secondary);
        }

        .chat-input {
          flex: 1;
          background: none;
          border: none;
          padding: var(--spacing-sm);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .chat-input:focus {
          outline: none;
        }

        .send-btn {
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--text-primary);
          color: var(--bg-primary);
          border: none;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: opacity var(--transition-fast);
        }

        .send-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
