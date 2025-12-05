import { useState, useCallback } from 'react';
import { ChatMessage, getChatHistory } from '../utils/api';

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const addMessage = useCallback((message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const loadHistory = useCallback(async (sessionId: string) => {
        try {
            const history = await getChatHistory(sessionId, 50);
            setMessages(history);
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    }, []);

    return {
        messages,
        addMessage,
        clearMessages,
        loadHistory
    };
}
