import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { ChatSession} from '../lib/types/chat';
import { getChatSessions, updateSessionName, deleteSession } from '../lib/services/sessionService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MessageSquare, Pencil, Trash2, Search } from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const loadSessions = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const chatSessions = await getChatSessions(user.uid);
        setSessions(chatSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    };

    loadSessions();
  }, [navigate]);

  const handleEdit = (session: ChatSession) => {
    setEditingId(session.id);
    setEditingName(session.name);
  };

  const handleSave = async (sessionId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateSessionName(user.uid, sessionId, editingName);
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId ? { ...session, name: editingName } : session
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error('Error updating session name:', error);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this chat session?')) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteSession(user.uid, sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Chat History</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your previous conversations
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                {editingId === session.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-48"
                    />
                    <Button onClick={() => handleSave(session.id)}>Save</Button>
                    <Button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <h3 className="font-medium text-gray-900">{session.name}</h3>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate(`/chat/${session.id}`)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-600"
                >
                  Continue Chat
                </Button>
                <Button
                  onClick={() => handleEdit(session)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(session.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {new Date(session.timestamp).toDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}