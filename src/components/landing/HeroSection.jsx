import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="flex"
      style={{ minHeight: 'calc(100vh - 64px)', marginTop: 64 }}
    >
      {/* Left content — 52% */}
      <div
        className="flex flex-col justify-center"
        style={{ width: '52%', paddingLeft: 80, paddingRight: 60 }}
      >
        <motion.p
          className="font-jost font-medium uppercase"
          style={{ fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A', marginBottom: 20 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          AI Skincare Advisor
        </motion.p>

        <motion.h1
          className="font-cormorant font-semibold"
          style={{ fontSize: 62, color: '#1A1F1A', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 18 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          Your Skin, Finally<br />Understood.
        </motion.h1>

        <motion.p
          className="font-jost"
          style={{ fontSize: 15, color: '#5C6B5C', lineHeight: 1.85, marginBottom: 32 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          Personalized routines and wellness guidance, built entirely around you.
        </motion.p>

        <motion.div
          className="flex items-center gap-4"
          style={{ marginBottom: 28 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
        >
          <Link to="/login">
            <motion.button
              className="font-jost font-semibold tracking-[0.1em] uppercase text-xs text-white rounded-[3px]"
              style={{ background: '#3D5A3E', padding: '14px 36px' }}
              whileHover={{ backgroundColor: '#2C3E2D', y: -1, boxShadow: '0 6px 20px rgba(61,90,62,0.22)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              Start Your Journey
            </motion.button>
          </Link>
          <a href="#how-it-works">
            <motion.button
              className="font-jost font-semibold tracking-[0.1em] uppercase text-xs rounded-[3px]"
              style={{ background: 'transparent', color: '#3D5A3E', border: '1.5px solid #3D5A3E', padding: '13px 35px' }}
              whileHover={{ backgroundColor: '#3D5A3E', color: '#fff' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              See How It Works
            </motion.button>
          </a>
        </motion.div>

        <motion.div
          className="flex items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {['✦ AI-Powered', '✦ Personalized', '✦ Free'].map((b) => (
            <span key={b} className="font-jost" style={{ fontSize: 11, color: '#9AAA9A' }}>{b}</span>
          ))}
        </motion.div>
      </div>

      {/* Right image — 48% */}
      <div className="flex-1 relative overflow-hidden" style={{ width: '48%' }}>
        <img
          src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200&q=85"
          alt="Skincare lifestyle"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* Mobile: stack vertically */}
      <style>{`
        @media (max-width: 768px) {
          #hero { flex-direction: column; min-height: auto; }
          #hero > div:first-child { width: 100% !important; padding: 48px 24px 40px !important; }
          #hero > div:last-child { width: 100% !important; height: 260px; position: relative !important; }
        }
      `}</style>
    </section>
  );
}