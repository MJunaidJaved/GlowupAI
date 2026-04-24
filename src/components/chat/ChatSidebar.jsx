import React from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatSidebar({ sessions, activeId, onSelect, onNew }) {
  return (
    <div className="hidden lg:flex flex-col w-72 border-r border-rose-gold/10 bg-white/50 backdrop-blur-sm h-full">
      <div className="p-4 border-b border-rose-gold/10">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-4 py-3 bg-deep-mauve text-white rounded-pill font-dm text-sm font-medium hover:shadow-glow transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={`w-full text-left p-3 rounded-2xl transition-all duration-200 group ${
              activeId === session.id
                ? 'bg-peach-bg border-l-4 border-rose-gold'
                : 'hover:bg-peach-bg/50'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <MessageCircle className="w-4 h-4 text-rose-gold mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-dm text-sm font-medium text-warm-charcoal truncate">
                  {session.title || 'New Chat'}
                </p>
                <p className="font-dm text-xs text-warm-gray mt-0.5 truncate">
                  {session.last_message_preview || 'No messages yet'}
                </p>
                <p className="font-dm text-[10px] text-warm-gray/60 mt-1">
                  {format(new Date(session.created_date), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          </button>
        ))}
        {sessions.length === 0 && (
          <p className="font-dm text-sm text-warm-gray text-center py-8">No chats yet. Start one!</p>
        )}
      </div>
    </div>
  );
}