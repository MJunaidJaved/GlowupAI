import React from 'react';
import { motion } from 'framer-motion';
import AnimatedSection from '../shared/AnimatedSection';

const steps = [
  {
    number: '01',
    title: 'Tell Us About Your Skin',
    description: 'Answer a few quick questions about your skin type, concerns, and lifestyle habits.',
  },
  {
    number: '02',
    title: 'Chat With Your Advisor',
    description: 'Get instant, personalized advice through our intelligent skincare chatbot.',
  },
  {
    number: '03',
    title: 'Get Your Perfect Routine',
    description: 'Receive a custom AM & PM skincare routine with curated recommendations.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6" style={{ background: '#F7F7F5' }}>
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <p className="font-jost font-medium uppercase mb-4" style={{ fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A' }}>
            The Process
          </p>
          <h2 className="font-cormorant font-semibold" style={{ fontSize: 40, color: '#1A1F1A', lineHeight: 1.2 }}>
            Three Steps to Glowing Skin
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <AnimatedSection key={step.number} delay={i * 0.08}>
              <motion.div
                className="bg-white p-8 h-full cursor-default"
                style={{ border: '1px solid #E2E8E2', borderRadius: 3 }}
                whileHover={{ y: -5, boxShadow: '0 8px 32px rgba(61,90,62,0.14)' }}
                transition={{ duration: 0.3 }}
              >
                {/* Ghost number */}
                <p className="font-cormorant font-light" style={{ fontSize: 80, color: '#E2E8E2', lineHeight: 1, marginBottom: 16 }}>
                  {step.number}
                </p>
                <h3 className="font-cormorant font-semibold mb-3" style={{ fontSize: 20, color: '#1A1F1A' }}>
                  {step.title}
                </h3>
                <p className="font-jost" style={{ fontSize: 14, color: '#5C6B5C', lineHeight: 1.7 }}>
                  {step.description}
                </p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}