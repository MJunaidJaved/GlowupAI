import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import GlowButton from '../shared/GlowButton';

const categoryIcons = {
  cleanser: '🧴', toner: '💧', serum: '✨', moisturizer: '🧊',
  spf: '☀️', mask: '🎭', exfoliant: '🌟', eye_cream: '👁️',
};

export default function ProductModal({ product, onClose }) {
  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-glow-lg max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 rounded-2xl bg-peach-bg flex items-center justify-center">
              <span className="text-3xl">{categoryIcons[product.category] || '🧴'}</span>
            </div>
            <button onClick={onClose} className="text-warm-gray hover:text-warm-charcoal transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <span className="px-3 py-1 bg-rose-gold/10 rounded-pill font-dm text-xs font-medium text-rose-gold uppercase">
            {product.category?.replace('_', ' ')}
          </span>

          <h2 className="font-playfair text-2xl font-bold text-warm-charcoal mt-3 mb-2">{product.name}</h2>
          <p className="font-dm text-warm-gray leading-relaxed mb-6">{product.description}</p>

          {product.key_ingredients?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-dm font-semibold text-warm-charcoal text-sm mb-2">Key Ingredients</h4>
              <div className="flex flex-wrap gap-2">
                {product.key_ingredients.map((ing) => (
                  <span key={ing} className="px-3 py-1.5 bg-lavender-chat rounded-pill font-dm text-xs text-deep-mauve">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.concerns?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-dm font-semibold text-warm-charcoal text-sm mb-2">Best For</h4>
              <div className="flex flex-wrap gap-2">
                {product.concerns.map((c) => (
                  <span key={c} className="px-3 py-1.5 bg-peach-bg rounded-pill font-dm text-xs text-warm-gray capitalize">
                    {c.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {(product.skin_types || []).map((type) => (
              <span key={type} className="px-3 py-1.5 bg-rose-chat rounded-pill font-dm text-xs text-deep-mauve capitalize">
                {type} skin
              </span>
            ))}
          </div>

          <GlowButton variant="primary" className="w-full" onClick={onClose}>
            Close
          </GlowButton>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}