import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedSection from '../shared/AnimatedSection';

export default function CTASection() {
  return (
    <section className="py-28 px-6" style={{ background: '#F7F7F5' }}>
      <div className="max-w-2xl mx-auto text-center">
        <AnimatedSection>
          <p className="font-jost font-medium uppercase mb-5" style={{ fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A' }}>
            Start Today
          </p>
          <h2 className="font-cormorant font-semibold mb-5" style={{ fontSize: 40, color: '#1A1F1A', lineHeight: 1.2 }}>
            Your Glow Journey Starts Now
          </h2>
          <p className="font-jost mb-10" style={{ fontSize: 15, color: '#5C6B5C', lineHeight: 1.85 }}>
            Join thousands who have transformed their skin with personalized AI-powered guidance.
          </p>
          <Link to="/login">
            <motion.button
              className="font-jost font-semibold tracking-[0.1em] uppercase text-xs text-white rounded-[3px]"
              style={{ background: '#3D5A3E', padding: '14px 36px' }}
              whileHover={{ backgroundColor: '#2C3E2D', y: -1, boxShadow: '0 6px 20px rgba(61,90,62,0.22)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              Get My Personalized Routine
            </motion.button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}