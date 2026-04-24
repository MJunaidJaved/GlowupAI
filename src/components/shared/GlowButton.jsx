import React from 'react';
import { motion } from 'framer-motion';

export default function GlowButton({
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}) {
  const base = 'relative font-jost font-semibold tracking-[0.1em] uppercase text-xs transition-all duration-200 cursor-pointer select-none';
  const radius = 'rounded-[3px]';

  const styles = {
    primary: {
      padding: '14px 36px',
      background: disabled ? '#6B8F6C' : '#3D5A3E',
      color: '#fff',
      border: 'none',
    },
    ghost: {
      padding: '13px 35px',
      background: 'transparent',
      color: '#3D5A3E',
      border: '1.5px solid #3D5A3E',
    },
    'ghost-light': {
      padding: '13px 35px',
      background: 'transparent',
      color: '#fff',
      border: '1.5px solid rgba(255,255,255,0.7)',
    },
    danger: {
      padding: '13px 35px',
      background: 'transparent',
      color: '#C0392B',
      border: '1px solid #C0392B',
    },
    // legacy aliases
    plum: {
      padding: '14px 36px',
      background: '#3D5A3E',
      color: '#fff',
      border: 'none',
    },
    outline: {
      padding: '13px 35px',
      background: 'transparent',
      color: '#3D5A3E',
      border: '1.5px solid #3D5A3E',
    },
    'rose-gold': {
      padding: '14px 36px',
      background: '#3D5A3E',
      color: '#fff',
      border: 'none',
    },
  };

  const s = styles[variant] ?? styles.primary;

  const hoverAnim = disabled ? {} : variant === 'primary'
    ? { y: -1, boxShadow: '0 6px 20px rgba(61,90,62,0.22)', backgroundColor: '#2C3E2D' }
    : variant === 'ghost' || variant === 'outline'
    ? { backgroundColor: '#3D5A3E', color: '#fff' }
    : variant === 'danger'
    ? { backgroundColor: '#C0392B', color: '#fff' }
    : { y: -1 };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={`${base} ${radius} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ ...s }}
      whileHover={hoverAnim}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}