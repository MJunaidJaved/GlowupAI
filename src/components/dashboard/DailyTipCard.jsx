import React, { useState, useEffect } from 'react';
import { Droplets, Moon, Sun } from 'lucide-react';

const tips = [
  { icon: Droplets, text: 'Drink at least 8 glasses of water today for glowing, hydrated skin.', type: 'water' },
  { icon: Moon, text: 'Aim for 8 hours of beauty sleep tonight — your skin repairs while you rest.', type: 'sleep' },
  { icon: Sun, text: 'Never skip sunscreen, even on cloudy days. UV protection is anti-aging!', type: 'sun' },
  { icon: Droplets, text: 'Add a hydrating serum before your moisturizer for extra plumpness.', type: 'water' },
  { icon: Moon, text: 'Sleep on a silk pillowcase to reduce friction and prevent wrinkles.', type: 'sleep' },
];

export default function DailyTipCard() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setTipIndex(dayOfYear % tips.length);
  }, []);

  const tip = tips[tipIndex];
  const Icon = tip.icon;

  return (
    <div className="rounded-3xl p-6 md:p-8 bg-white shadow-glow relative overflow-hidden">
      <div className="absolute inset-0 rounded-3xl animated-border opacity-20" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-peach-bg flex items-center justify-center">
            <Icon className="w-5 h-5 text-rose-gold" />
          </div>
          <p className="font-cormorant text-xs tracking-[0.2em] uppercase text-rose-gold">Daily Tip</p>
        </div>
        <p className="font-playfair text-lg md:text-xl text-warm-charcoal leading-relaxed italic">
          "{tip.text}"
        </p>
      </div>
    </div>
  );
}