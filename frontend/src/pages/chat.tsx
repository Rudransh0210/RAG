import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { createChatSession, saveSession } from '../lib/services/sessionService';
import { useChat } from '../lib/hooks/useChat';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Send } from 'lucide-react';

export default function ChatPage() {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | undefined>(urlSessionId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading, initialized, sendMessage } = useChat(sessionId);

  useEffect(() => {
    const initializeSession = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      if (!urlSessionId) {
        const newSessionId = await createChatSession();
        setSessionId(newSessionId);
        navigate(`/chat/${newSessionId}`);
      }
    };

    initializeSession();
  }, [urlSessionId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    // Save the session only when the first message is sent
    if (messages.length === 1 && messages[0].id === 'initial-message') {
      await saveSession(user.uid, sessionId);
    }

    await sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.response === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.response === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{message.text}</p>
              <span className="text-xs opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={loading || !initialized}
          />
          <Button onClick={handleSend} disabled={loading || !initialized}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}