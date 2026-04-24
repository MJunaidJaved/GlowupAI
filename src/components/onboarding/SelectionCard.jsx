import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function SelectionCard({ title, description, selected, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="relative w-full text-left transition-all duration-200"
      style={{
        padding: '20px 24px',
        borderRadius: 3,
        border: selected ? '2px solid #3D5A3E' : '1px solid #E2E8E2',
        background: selected ? '#E8EFE8' : '#fff',
      }}
      whileTap={{ scale: 0.98 }}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded-sm"
          style={{ background: '#3D5A3E' }}
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
      <h3 className="font-jost font-medium" style={{ fontSize: 14, color: '#1A1F1A' }}>{title}</h3>
      {description && (
        <p className="font-jost mt-1" style={{ fontSize: 12, color: '#5C6B5C' }}>{description}</p>
      )}
    </motion.button>
  );
}