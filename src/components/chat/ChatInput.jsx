import React, { useState } from 'react';
import { Send } from 'lucide-react';

const suggestions = [
  "What's my skin type routine?",
  "Recommend a moisturizer",
  "Give me a tip for acne",
  "How do I get glass skin?",
  "Best SPF for daily use?",
];

export default function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage('');
  };

  const handleSuggestion = (text) => {
    onSend(text);
  };

  return (
    <div className="border-t border-rose-gold/10 bg-white/80 backdrop-blur-lg p-4">
      {/* Suggestion chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleSuggestion(s)}
            disabled={disabled}
            className="flex-shrink-0 px-4 py-2 bg-peach-bg rounded-pill font-dm text-xs text-deep-mauve hover:bg-dusty-pink/30 transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me about your skin..."
          disabled={disabled}
          className="flex-1 px-5 py-3.5 bg-peach-bg rounded-pill font-dm text-sm text-warm-charcoal placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-rose-gold/30 transition-all disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="w-12 h-12 rounded-full bg-rose-gold text-white flex items-center justify-center hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}