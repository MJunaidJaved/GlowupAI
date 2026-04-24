import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const messages = [
  'Analyzing your skin profile...',
  'Building your routine...',
  'Almost ready...',
];

export default function StepComplete() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-8">
        <div className="relative w-28 h-28 mx-auto">
          <svg className="w-28 h-28" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#E2E8E2" strokeWidth="3" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none" stroke="#3D5A3E" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="339.3"
              initial={{ strokeDashoffset: 339.3 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 3, ease: 'easeInOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-cormorant font-semibold text-2xl" style={{ color: '#C8A882' }}>✦</span>
          </div>
        </div>

        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="font-jost"
          style={{ fontSize: 15, color: '#5C6B5C' }}
        >
          {messages[msgIndex]}
        </motion.p>
      </div>
    </div>
  );
}