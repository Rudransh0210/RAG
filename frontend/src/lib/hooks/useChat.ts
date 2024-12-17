import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { ChatMessage } from '../types/chat';
import { getChatMessages, sendMessage } from '../services/messageService';
import { INITIAL_BOT_MESSAGE } from '../constants/messages';

export function useChat(sessionId: string | undefined) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      if (!sessionId) {
        return;
      }

      try {
        const chatMessages = await getChatMessages(user.uid, sessionId);
        if (chatMessages.length === 0) {
          // Only add initial message if there are no existing messages
          setMessages([{
            id: 'initial-message',
            text: INITIAL_BOT_MESSAGE,
            response: 'bot',
            timestamp: new Date()
          }]);
        } else {
          setMessages(chatMessages);
        }
        setInitialized(true);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [sessionId, navigate]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !sessionId) return;

    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const { userMessage, botMessage } = await sendMessage(user.uid, sessionId, text.trim());
      setMessages(prev => [...prev.filter(msg => msg.id !== 'initial-message'), userMessage, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    initialized,
    sendMessage: handleSendMessage
  };
}