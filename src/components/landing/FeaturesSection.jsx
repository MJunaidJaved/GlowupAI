import React from 'react';
import { motion } from 'framer-motion';
import AnimatedSection from '../shared/AnimatedSection';

const features = [
  {
    label: 'Analysis',
    title: 'Personalized Skin Analysis',
    description: 'Our AI builds a complete picture of your skin health from type to lifestyle.',
    image: 'https://images.unsplash.com/photo-1728727267814-792db55ce678?w=800&q=80',
  },
  {
    label: 'Advisor',
    title: 'Smart Chatbot Advisor',
    description: 'Get instant expert skincare advice tailored to your unique skin profile.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
  },
  {
    label: 'Reminders',
    title: 'Daily Glow Reminders',
    description: 'Stay on track with gentle reminders for your routine and wellness habits.',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
  },
  {
    label: 'Wellness',
    title: 'Wellness & Lifestyle Tips',
    description: 'Personalized guidance on hydration, sleep, nutrition, and stress management.',
    image: 'https://plus.unsplash.com/premium_photo-1661436342069-4ce3cc17f1a7?w=800&q=80',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <p className="font-jost font-medium uppercase mb-4" style={{ fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A' }}>
            Features
          </p>
          <h2 className="font-cormorant font-semibold" style={{ fontSize: 40, color: '#1A1F1A', lineHeight: 1.2 }}>
            Everything Your Skin Needs
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <AnimatedSection key={f.label} delay={i * 0.08}>
              <motion.div
                className="bg-white overflow-hidden cursor-default group"
                style={{ border: '1px solid #E2E8E2', borderRadius: 3 }}
                whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(61,90,62,0.12)' }}
                transition={{ duration: 0.25 }}
              >
                {/* Top half — image */}
                <div className="overflow-hidden" style={{ height: 220 }}>
                  <motion.img
                    src={f.image}
                    alt={f.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* Bottom half — content */}
                <div style={{ padding: 24 }}>
                  <p className="font-jost font-medium uppercase mb-2" style={{ fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A' }}>
                    {f.label}
                  </p>
                  <h3 className="font-cormorant font-semibold mb-2" style={{ fontSize: 20, color: '#1A1F1A' }}>
                    {f.title}
                  </h3>
                  <p className="font-jost" style={{ fontSize: 13, color: '#5C6B5C', lineHeight: 1.7 }}>
                    {f.description}
                  </p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}