import React from 'react';
import { motion } from 'framer-motion';

export default function StepWelcome({ name, onNext }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ marginTop: -64 }}>
      {/* Left — full-height image */}
      <div className="hidden md:block relative overflow-hidden" style={{ width: '50%' }}>
        <img
          src="https://images.unsplash.com/photo-1602631637744-95548611264d?w=1200&q=85"
          alt="Skincare"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Bottom gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(28,40,28,0.5) 0%, transparent 55%)' }}
        />
      </div>

      {/* Right — content */}
      <div
        className="flex flex-col justify-center flex-1 bg-white"
        style={{ padding: '64px' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="font-jost font-medium uppercase mb-6" style={{ fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A' }}>
            Welcome
          </p>
          <h1 className="font-cormorant font-semibold" style={{ fontSize: 50, color: '#1A1F1A', lineHeight: 1.1 }}>
            Hello, {name}.
          </h1>
          <h2 className="font-cormorant font-normal mt-2 mb-6" style={{ fontSize: 32, color: '#5C6B5C', lineHeight: 1.2 }}>
            Let's build your skin profile.
          </h2>
          <p className="font-jost mb-9" style={{ fontSize: 14, color: '#9AAA9A', lineHeight: 1.7 }}>
            Four quick questions, completely personalized to you.
          </p>
          <motion.button
            onClick={onNext}
            className="w-full font-jost font-semibold tracking-[0.1em] uppercase text-xs text-white rounded-[3px] mb-4"
            style={{ background: '#3D5A3E', padding: '14px 36px' }}
            whileHover={{ backgroundColor: '#2C3E2D', y: -1, boxShadow: '0 6px 20px rgba(61,90,62,0.22)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            Let's Begin
          </motion.button>
          <p className="font-jost text-center" style={{ fontSize: 11, color: '#9AAA9A' }}>
            Takes less than 2 minutes
          </p>
        </motion.div>
      </div>

      {/* Mobile: image strip at top */}
      <style>{`
        @media (max-width: 768px) {
          .welcome-screen { flex-direction: column !important; }
          .welcome-image { display: block !important; width: 100% !important; height: 38vh !important; }
          .welcome-content { padding: 40px 28px !important; }
        }
      `}</style>
    </div>
  );
}