import React from 'react';
import { motion } from 'framer-motion';
import AnimatedSection from '../shared/AnimatedSection';

const testimonials = [
  { name: 'Amara J.', age: 24, concern: 'Acne-prone skin', quote: 'My skin has completely transformed in 6 weeks. The AI routine is genuinely personalized — nothing generic!', rating: 5, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80' },
  { name: 'Sofia R.', age: 29, concern: 'Dry & sensitive', quote: "I've tried so many skincare apps. This one actually listens. My hydration is through the roof now.", rating: 5, avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80' },
  { name: 'Priya M.', age: 22, concern: 'Dark spots & glow', quote: 'The progress tracker keeps me motivated. I can literally see my skin improving week by week.', rating: 5, avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=120&q=80' },
  { name: 'Lena K.', age: 31, concern: 'Combination skin', quote: 'Finally an AI that understands combination skin. My T-zone is balanced and I actually glow now!', rating: 5, avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&q=80' },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32 px-6" style={{ background: 'linear-gradient(135deg,#F7E1EE,#F1C2D2)' }}>
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <p className="font-cormorant text-sm tracking-[0.3em] uppercase mb-4" style={{ color: '#D8598C' }}>Testimonials</p>
          <h2 className="font-playfair font-bold" style={{ fontSize: 'clamp(28px,4vw,38px)', color: '#2D1B35' }}>
            Real Skin. Real Results.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 0.1}>
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-card border h-full"
                style={{ borderColor: '#F1C2D2' }}
                whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(216,89,140,.18)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-[52px] h-[52px] rounded-full object-cover"
                    />
                    <div className="absolute inset-0 rounded-full" style={{ border: '2.5px solid #E37AB1', outline: '2px solid transparent' }} />
                  </div>
                  <div>
                    <p className="font-inter text-sm font-semibold" style={{ color: '#2D1B35' }}>{t.name}</p>
                    <p className="font-inter text-xs" style={{ color: '#9D6099' }}>{t.concern}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} style={{ color: '#D8598C' }}>★</span>
                  ))}
                </div>
                <p className="font-inter text-sm leading-relaxed italic" style={{ color: '#5C4B75' }}>"{t.quote}"</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}