import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 30 : -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-lavender-chat flex items-center justify-center mr-3 flex-shrink-0 mt-1">
          <span className="text-xs text-deep-mauve">✦</span>
        </div>
      )}
      <div className={`max-w-[80%] lg:max-w-[60%]`}>
        <div
          className={`rounded-3xl px-5 py-3.5 ${
            isUser
              ? 'bg-deep-mauve text-white rounded-tr-lg'
              : 'bg-lavender-chat text-warm-charcoal rounded-tl-lg'
          }`}
        >
          {isUser ? (
            <p className="font-dm text-sm leading-relaxed">{message.message_text}</p>
          ) : (
            <div className="font-dm text-sm leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="my-1">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc ml-4 my-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-4 my-1">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                }}
              >
                {message.message_text}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <p className={`font-dm text-[10px] text-warm-gray/50 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.created_date ? format(new Date(message.created_date), 'h:mm a') : ''}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-rose-chat flex items-center justify-center ml-3 flex-shrink-0 mt-1">
          <span className="text-xs text-deep-mauve">You</span>
        </div>
      )}
    </motion.div>
  );
}