import React from 'react';
import AnimatedSection from '../shared/AnimatedSection';

const stats = [
  { value: '50K+', label: 'Happy Users' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '12K+', label: 'Routines Created' },
];

export default function StatsBanner() {
  return (
    <section className="py-20 px-6" style={{ background: '#2C3E2D' }}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.1} className="text-center">
              <p className="font-cormorant font-semibold text-white mb-2" style={{ fontSize: 52, lineHeight: 1 }}>
                {stat.value}
              </p>
              <p className="font-jost font-medium uppercase" style={{ fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A' }}>
                {stat.label}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}