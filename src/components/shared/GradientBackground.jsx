import React from 'react';

export default function GradientBackground({ children, className = '' }) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: 'linear-gradient(135deg, #FDF0E8, #F5D6D6, #E8D5F0)',
      }}
    >
      {children}
    </div>
  );
}