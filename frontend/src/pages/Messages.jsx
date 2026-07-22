import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import axiosClient from '../api/axiosClient';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

function initials(name) {
  return (
    name
      ?.split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    axiosClient.get('/messages/conversations').then((r) => setConversations(r.data.data));
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    axiosClient
      .get(`/messages/conversations/${conversationId}/messages`)
      .then((r) => setMessages(r.data.data));

    socket?.emit('conversation:join', conversationId);
  }, [conversationId, socket]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (String(msg.conversationId) === String(conversationId)) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('message:new', handler);
    return () => socket.off('message:new', handler);
  }, [socket, conversationId]);

  function sendMessage() {
    if (!draft.trim() || !socket) return;
    socket.emit('message:send', { conversationId, body: draft });
    setDraft('');
  }

  const activeConversation = conversations.find((c) => String(c.id) === conversationId);

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Messages</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
        <div className="bg-white border border-stone-200 rounded-xl p-3 overflow-y-auto">
          <h2 className="font-semibold mb-2 px-2 text-sm text-slate-500">Conversations</h2>
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/messages/${c.id}`)}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer ${
                String(c.id) === conversationId ? 'bg-brand-50' : 'hover:bg-stone-100'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                {initials(c.other_user_name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.other_user_name || `User #${c.other_user_id}`}</p>
                <p className="text-xs text-slate-500 truncate">{c.last_message || 'New conversation'}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 bg-white border border-stone-200 rounded-xl flex flex-col">
          {activeConversation && (
            <div className="px-4 py-3 border-b border-stone-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                {initials(activeConversation.other_user_name)}
              </div>
              <p className="font-medium">
                {activeConversation.other_user_name || `User #${activeConversation.other_user_id}`}
              </p>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`text-sm rounded-2xl px-3.5 py-2 w-fit max-w-[70%] ${
                      mine ? 'bg-brand-600 text-white' : 'bg-stone-100 text-slate-800'
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 border-t border-stone-200 flex gap-2">
            <input
              className="flex-1 rounded-full border border-stone-300 px-4 py-2 outline-none text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-full px-4 text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
