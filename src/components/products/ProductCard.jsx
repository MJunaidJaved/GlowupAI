import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

const categoryIcons = {
  cleanser: '🧴', toner: '💧', serum: '✨', moisturizer: '🧊',
  spf: '☀️', mask: '🎭', exfoliant: '🌟', eye_cream: '👁️',
};

const priceLabels = { budget: '$', mid: '$$', premium: '$$$' };

export default function ProductCard({ product, onQuickView }) {
  return (
    <motion.div
      className="group bg-white rounded-3xl p-5 shadow-glow-sm hover:shadow-glow transition-all duration-300 cursor-pointer"
      whileHover={{ y: -4 }}
      onClick={() => onQuickView(product)}
    >
      <div className="w-full aspect-square rounded-2xl bg-peach-bg flex items-center justify-center mb-4 relative overflow-hidden">
        <span className="text-4xl">{categoryIcons[product.category] || '🧴'}</span>
        <div className="absolute inset-0 bg-deep-mauve/0 group-hover:bg-deep-mauve/10 transition-colors flex items-center justify-center">
          <span className="font-dm text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity bg-deep-mauve/80 px-3 py-1.5 rounded-pill">
            Quick View
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between mb-2">
        <span className="px-3 py-1 bg-rose-gold/10 rounded-pill font-dm text-[10px] font-medium text-rose-gold uppercase">
          {product.category?.replace('_', ' ')}
        </span>
        <span className="font-dm text-xs text-warm-gray">{priceLabels[product.price_range] || ''}</span>
      </div>

      <h3 className="font-dm font-semibold text-warm-charcoal text-sm mb-1 line-clamp-1">{product.name}</h3>
      <p className="font-dm text-xs text-warm-gray line-clamp-2 mb-3">{product.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {(product.skin_types || []).slice(0, 2).map((type) => (
          <span key={type} className="px-2 py-0.5 bg-peach-bg rounded-pill font-dm text-[10px] text-warm-gray capitalize">
            {type}
          </span>
        ))}
      </div>
    </motion.div>
  );
}