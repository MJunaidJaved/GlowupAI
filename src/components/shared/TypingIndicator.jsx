import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-3.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full typing-dot-${i}`}
          style={{ background: '#9AAA9A' }}
        />
      ))}
    </div>
  );
}