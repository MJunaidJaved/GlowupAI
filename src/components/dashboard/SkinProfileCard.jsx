import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';

const skinTypeLabels = {
  oily: 'Oily Skin', dry: 'Dry Skin', combination: 'Combination Skin', sensitive: 'Sensitive Skin',
};

const concernLabels = {
  acne: 'Acne', dark_spots: 'Dark Spots', dullness: 'Dullness', dryness: 'Dryness',
  oiliness: 'Oiliness', anti_aging: 'Anti-Aging', sensitivity: 'Sensitivity',
  uneven_texture: 'Uneven Texture', dark_circles: 'Dark Circles', redness: 'Redness',
};

export default function SkinProfileCard({ profile }) {
  if (!profile) return null;

  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{ perspective: 1000 }}
      className="rounded-3xl p-6 md:p-8 shadow-glow relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-80" style={{ background: 'linear-gradient(135deg, #FDF0E8, #F5D6D6, #E8D5F0)' }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-cormorant text-xs tracking-[0.2em] uppercase text-rose-gold mb-1">Your Skin Profile</p>
            <h3 className="font-playfair text-xl md:text-2xl font-bold text-warm-charcoal">
              {skinTypeLabels[profile.skin_type] || profile.skin_type}
            </h3>
          </div>
          <Link to="/settings" className="text-warm-gray hover:text-rose-gold transition-colors">
            <Pencil className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {(profile.skin_concerns || []).slice(0, 3).map((concern) => (
            <span key={concern} className="px-3 py-1 bg-white/60 rounded-pill text-xs font-dm text-deep-mauve">
              {concernLabels[concern] || concern}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}