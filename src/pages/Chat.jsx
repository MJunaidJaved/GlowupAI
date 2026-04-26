import { api } from '../api/client'
import React, { useState, useEffect, useRef } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Send, Sparkles, Trash2 } from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';
import ChatBubble from '../components/chat/ChatBubble';
import TypingIndicator from '../components/shared/TypingIndicator';
import { toast } from '@/components/ui/use-toast';

function ChatSessionSidebar({ sessions, activeId, onSelect, onNew, onDelete, deletingSessionId }) {
  const normalizedActiveId = activeId != null ? String(activeId) : null;
  const normalizedDeletingId = deletingSessionId != null ? String(deletingSessionId) : null;

  return (
    <div className="hidden lg:flex flex-col bg-white h-full" style={{ width: 280, minWidth: 280, borderRight: '1px solid #E2E8E2' }}>
      <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #E2E8E2' }}>
        <h2 className="font-cormorant font-semibold" style={{ fontSize: 20, color: '#1A1F1A' }}>My Chats</h2>
        <motion.button
          onClick={onNew}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 flex items-center justify-center text-white"
          style={{ background: '#3D5A3E', borderRadius: 3 }}
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="w-full p-3 transition-all duration-150"
            style={{
              borderRadius: 3,
              borderLeft: normalizedActiveId === String(s.id) ? '3px solid #3D5A3E' : '3px solid transparent',
              background: normalizedActiveId === String(s.id) ? '#E8EFE8' : 'transparent',
            }}
            onMouseEnter={(e) => { if (normalizedActiveId !== String(s.id)) e.currentTarget.style.background = '#F7F7F5'; }}
            onMouseLeave={(e) => { if (normalizedActiveId !== String(s.id)) e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => onSelect(s.id)}
                className="text-left min-w-0 flex-1"
              >
                <p className="font-jost text-sm font-medium truncate" style={{ color: '#1A1F1A' }}>
                  {s.title?.slice(0, 30) || 'New Chat'}
                </p>
                <p className="font-jost mt-0.5" style={{ fontSize: 11, color: '#9AAA9A' }}>
                  {s.created_date ? format(new Date(s.created_date), 'MMM d, h:mm a') : ''}
                </p>
              </button>
              <button
                type="button"
                aria-label="Delete chat"
                title="Delete chat"
                disabled={normalizedDeletingId === String(s.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(s.id);
                }}
                className="mt-0.5 p-1 disabled:opacity-50"
                style={{ color: '#9AAA9A' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="font-jost text-sm text-center py-10" style={{ color: '#9AAA9A' }}>No chats yet</p>
        )}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  { generic: "What's my skin type routine?", personalized: "What routine works best for my skin?" },
  { generic: "Best moisturizer for me", personalized: "Recommend a moisturizer for my skin" },
  { generic: "Help with acne", personalized: "How can I improve my skin concerns?" },
  { generic: "My morning routine", personalized: "Walk me through my morning routine" },
  { generic: "Glow tips for tonight", personalized: "What should I do tonight for better skin?" },
];

export default function Chat() {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const sessionStorageKey = user?.email ? `chat:lastSession:${user.email}` : null;

  useEffect(() => {
    api.get('/api/auth/me').then((u) => {
      setUser(u);
      api.get('/api/skin-profile').then(setProfile).catch(() => {});
    }).catch(() => {});
  }, []);

  const { data: sessions = [] } = useQuery({
    queryKey: ['chatSessions', user?.email],
    queryFn: () => user ? api.get('/api/chat/sessions') : [],
    enabled: !!user,
  });

  useEffect(() => {
    if (!sessionStorageKey) return;
    const storedSessionId = localStorage.getItem(sessionStorageKey);
    if (storedSessionId) {
      setActiveSessionId(storedSessionId);
    }
  }, [sessionStorageKey]);

  useEffect(() => {
    if (!sessionStorageKey) return;
    if (activeSessionId) {
      localStorage.setItem(sessionStorageKey, activeSessionId);
    } else {
      localStorage.removeItem(sessionStorageKey);
    }
  }, [activeSessionId, sessionStorageKey]);

  useEffect(() => {
    if (!activeSessionId || sessions.length === 0) return;
    const isActiveSessionValid = sessions.some((session) => String(session.id) === String(activeSessionId));
    if (!isActiveSessionValid) {
      setActiveSessionId(null);
      if (sessionStorageKey) {
        localStorage.removeItem(sessionStorageKey);
      }
    }
  }, [activeSessionId, sessions, sessionStorageKey]);

  const { data: messages = [] } = useQuery({
    queryKey: ['chatMessages', activeSessionId],
    queryFn: () => activeSessionId
      ? api.get(`/api/chat/sessions/${activeSessionId}/messages`)
      : [],
    enabled: !!activeSessionId,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useMutation({
    mutationFn: async (text) => {
      let sessionId = activeSessionId;
      if (!sessionId) {
        const session = await api.post('/api/chat/sessions', { title: text.slice(0, 50) });
        sessionId = session.id;
        setActiveSessionId(sessionId);
        queryClient.invalidateQueries({ queryKey: ['chatSessions', user?.email] });
      }
      await api.post(`/api/chat/sessions/${sessionId}/messages`, { role: 'user', message_text: text });
      queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });
      setIsTyping(true);

      const skinContext = profile
        ? `Skin type: ${profile.skin_type}. Concerns: ${(profile.skin_concerns || []).join(', ')}. Goal: ${profile.beauty_goal}. Water: ${profile.water_intake}. Sleep: ${profile.sleep_hours}. Diet: ${profile.diet_type}.`
        : 'No skin profile available.';

      const response = await api.post('/api/chat/ai-response', {
        message: text,
        skin_context: skinContext
      });

      setIsTyping(false);
      await api.post(`/api/chat/sessions/${sessionId}/messages`, { role: 'ai', message_text: response.message });
      await api.put(`/api/chat/sessions/${sessionId}`, { last_message_preview: text.slice(0, 80) });
      queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['chatSessions', user?.email] });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (sessionId) => {
      await api.delete(`/api/chat/sessions/${sessionId}`);
      return sessionId;
    },
    onSuccess: (deletedSessionId) => {
      if (String(deletedSessionId) === String(activeSessionId)) {
        setActiveSessionId(null);
      }
      if (sessionStorageKey && String(deletedSessionId) === localStorage.getItem(sessionStorageKey)) {
        localStorage.removeItem(sessionStorageKey);
      }
      queryClient.invalidateQueries({ queryKey: ['chatSessions', user?.email] });
      queryClient.removeQueries({ queryKey: ['chatMessages', deletedSessionId] });
      toast({
        title: 'Chat deleted',
        description: 'The conversation was removed successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Delete failed',
        description: 'Could not delete this chat. Please try again.',
      });
    },
  });

  const handleDeleteSession = (sessionId) => {
    if (deleteSession.isPending) return;
    deleteSession.mutate(sessionId);
  };

  const handleSend = () => {
    const t = message.trim();
    if (!t || sendMessage.isPending) return;
    setMessage('');
    sendMessage.mutate(t);
  };

  return (
    <PageTransition>
      <div className="flex h-screen overflow-hidden">
        <ChatSessionSidebar
          sessions={sessions}
          activeId={activeSessionId}
          onSelect={setActiveSessionId}
          onNew={() => setActiveSessionId(null)}
          onDelete={handleDeleteSession}
          deletingSessionId={deleteSession.isPending ? deleteSession.variables : null}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center px-6 py-4 bg-white flex-shrink-0" style={{ borderBottom: '1px solid #E2E8E2' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center" style={{ background: '#E8EFE8', borderRadius: 3 }}>
                <Sparkles className="w-4 h-4" style={{ color: '#3D5A3E' }} />
              </div>
              <div>
                <h2 className="font-cormorant font-semibold" style={{ fontSize: 20, color: '#1A1F1A' }}>Glow-Up Advisor</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#C8A882' }} />
                  <span className="font-jost" style={{ fontSize: 11, color: '#9AAA9A' }}>Your personal skincare AI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6" style={{ background: '#FAFAFA' }}>
            <AnimatePresence>
              {messages.length === 0 && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center py-20"
                >
                  <div className="w-16 h-16 flex items-center justify-center mb-5" style={{ background: '#E8EFE8', borderRadius: 3 }}>
                    <Sparkles className="w-7 h-7" style={{ color: '#3D5A3E' }} />
                  </div>
                  <h3 className="font-cormorant font-semibold mb-2" style={{ fontSize: 24, color: '#1A1F1A' }}>Your AI Skincare Advisor</h3>
                  <p className="font-jost max-w-sm" style={{ fontSize: 14, color: '#5C6B5C', lineHeight: 1.7 }}>
                    Ask me anything about skincare routines, product recommendations, or wellness tips.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-lavender-chat flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-deep-mauve">✦</span>
                </div>
                <div className="bg-lavender-chat rounded-3xl rounded-tl-lg">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 bg-white px-4 pt-3 pb-4" style={{ borderTop: '1px solid #E2E8E2' }}>
            <AnimatePresence>
              {!message && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 overflow-x-auto pb-3 no-scrollbar"
                >
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.personalized}
                      onClick={() => sendMessage.mutate(profile ? s.personalized : s.generic)}
                      disabled={sendMessage.isPending}
                      className="flex-shrink-0 font-jost transition-all duration-150"
                      style={{ padding: '6px 14px', border: '1px solid #E2E8E2', borderRadius: 3, fontSize: 11, color: '#5C6B5C', background: '#fff', whiteSpace: 'nowrap' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#E8EFE8'; e.currentTarget.style.borderColor = '#3D5A3E'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E2E8E2'; }}
                    >
                      {profile ? s.personalized : s.generic}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about your skin..."
                disabled={sendMessage.isPending}
                className="flex-1 font-jost text-sm"
                style={{
                  height: 48,
                  padding: '0 16px',
                  border: '1px solid #E2E8E2',
                  borderRadius: 3,
                  outline: 'none',
                  background: '#fff',
                  color: '#1A1F1A',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3D5A3E'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E2E8E2'; }}
              />
              <motion.button
                onClick={handleSend}
                disabled={sendMessage.isPending || !message.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50"
                style={{ width: 40, height: 40, background: '#3D5A3E', borderRadius: 3 }}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}