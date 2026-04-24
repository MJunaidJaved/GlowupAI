import React from 'react';
import { motion } from 'framer-motion';

export default function HoverCard({ children, className = '' }) {
  return (
    <motion.div
      className={`bg-card-pink rounded-3xl p-6 shadow-card border border-border-pink ${className}`}
      whileHover={{ y: -6, boxShadow: '0 12px 40px  rgba(194, 24, 91, 0.15)', borderColor: ' #F8BBD9' }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}