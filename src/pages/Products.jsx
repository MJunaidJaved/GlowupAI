import { api } from '../api/client'
import React, { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';
import AnimatedSection from '../components/shared/AnimatedSection';

const categoryIcons = { cleanser: '○', toner: '◇', serum: '◆', moisturizer: '□', spf: '◎', mask: '▽', exfoliant: '△', eye_cream: '◉' };
const priceLabels = { budget: '$', mid: '$$', premium: '$$$' };
const categories = ['all', 'cleanser', 'toner', 'serum', 'moisturizer', 'spf', 'mask', 'exfoliant', 'eye_cream'];
const skinTypes = ['all', 'oily', 'dry', 'combination', 'sensitive'];

const cardStyle = { background: '#fff', border: '1px solid #E2E8E2', borderRadius: 3, boxShadow: '0 2px 16px rgba(61,90,62,0.08)' };
const labelStyle = { fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A', fontFamily: 'var(--font-jost)', fontWeight: 500 };

function ProductCard({ product, onQuickView }) {
  return (
    <motion.div
      style={{ ...cardStyle, padding: 20, cursor: 'pointer' }}
      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(61,90,62,0.14)' }}
      transition={{ duration: 0.25 }}
      onClick={() => onQuickView(product)}
    >
      <div className="w-full aspect-square flex items-center justify-center mb-4" style={{ background: '#F7F7F5', borderRadius: 3 }}>
        <span className="font-cormorant font-light" style={{ fontSize: 36, color: '#E2E8E2' }}>
          {categoryIcons[product.category] || '○'}
        </span>
      </div>
      <div className="flex items-start justify-between mb-2">
        <span className="font-jost font-medium uppercase" style={{ fontSize: 10, background: '#E8EFE8', color: '#3D5A3E', padding: '2px 8px', borderRadius: 2 }}>
          {product.category?.replace('_', ' ')}
        </span>
        <span className="font-jost" style={{ fontSize: 11, color: '#9AAA9A' }}>{priceLabels[product.price_range] || ''}</span>
      </div>
      <h3 className="font-jost font-semibold text-sm mb-1 line-clamp-1" style={{ color: '#1A1F1A' }}>{product.name}</h3>
      <p className="font-jost text-xs line-clamp-2" style={{ color: '#5C6B5C' }}>{product.description}</p>
    </motion.div>
  );
}

function ProductModal({ product, onClose, userConcerns }) {
  if (!product) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.12)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28 }}
          style={{ ...cardStyle, maxWidth: 480, width: '100%', padding: 32, maxHeight: '80vh', overflowY: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-5">
            <div className="w-12 h-12 flex items-center justify-center" style={{ background: '#E8EFE8', borderRadius: 3 }}>
              <span className="font-cormorant font-light" style={{ fontSize: 24, color: '#3D5A3E' }}>
                {categoryIcons[product.category] || '○'}
              </span>
            </div>
            <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#9AAA9A' }} /></button>
          </div>
          <span className="font-jost font-medium uppercase" style={{ fontSize: 10, background: '#E8EFE8', color: '#3D5A3E', padding: '2px 8px', borderRadius: 2 }}>
            {product.category?.replace('_', ' ')}
          </span>
          {(product.concerns || []).some(c => (userConcerns || []).includes(c)) && (
            <span className="font-jost font-medium uppercase ml-2" style={{ fontSize: 10, background: '#3D5A3E', color: '#fff', padding: '2px 8px', borderRadius: 2 }}>
              Recommended for you
            </span>
          )}
          <h2 className="font-cormorant font-semibold mt-3 mb-2" style={{ fontSize: 26, color: '#1A1F1A' }}>{product.name}</h2>
          <p className="font-jost mb-5" style={{ fontSize: 14, color: '#5C6B5C', lineHeight: 1.7 }}>{product.description}</p>
          {product.key_ingredients?.length > 0 && (
            <div className="mb-5">
              <h4 className="font-jost font-semibold mb-2" style={{ fontSize: 11, color: '#1A1F1A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Key Ingredients</h4>
              <div className="flex flex-wrap gap-2">
                {product.key_ingredients.map((ing) => (
                  <span key={ing} className="font-jost" style={{ fontSize: 11, background: '#E8EFE8', color: '#3D5A3E', padding: '3px 10px', borderRadius: 2 }}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
          <motion.button
            onClick={onClose}
            className="w-full font-jost font-semibold tracking-[0.1em] uppercase text-xs text-white"
            style={{ background: '#3D5A3E', padding: '14px 36px', borderRadius: 3 }}
            whileHover={{ backgroundColor: '#2C3E2D' }}
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FilterChip({ value, current, onChange, label }) {
  const isActive = current === value;
  return (
    <button
      onClick={() => onChange(value)}
      className="font-jost font-medium transition-all duration-150"
      style={{
        padding: '6px 16px',
        border: isActive ? 'none' : '1px solid #E2E8E2',
        borderRadius: 3,
        fontSize: 12,
        background: isActive ? '#3D5A3E' : '#fff',
        color: isActive ? '#fff' : '#5C6B5C',
      }}
    >
      {label}
    </button>
  );
}

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkinType, setSelectedSkinType] = useState('all');
  const [modalProduct, setModalProduct] = useState(null);
  const [profile, setProfile] = useState(null);

  // Auto-select user's skin type from their profile
  useEffect(() => {
    api.get('/api/skin-profile').then((p) => {
      setProfile(p);
      if (p?.skin_type && skinTypes.includes(p.skin_type)) {
        setSelectedSkinType(p.skin_type);
      }
    }).catch(() => {});
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/api/products'),
  });

  const filtered = products.filter((p) => {
    const catMatch = selectedCategory === 'all' || p.category === selectedCategory;
    const skinMatch = selectedSkinType === 'all' || (p.skin_types || []).includes(selectedSkinType);
    return catMatch && skinMatch;
  });

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8 lg:p-10" style={{ background: '#F7F7F5' }}>
        <AnimatedSection>
          <p className="font-jost font-medium uppercase mb-1" style={labelStyle}>Discover</p>
          <h1 className="font-cormorant font-semibold mb-2" style={{ fontSize: 40, color: '#1A1F1A', lineHeight: 1.2 }}>Product Catalog</h1>
          <p className="font-jost mb-6" style={{ fontSize: 14, color: '#5C6B5C' }}>
            {profile ? `Showing products matched to your ${profile.skin_type} skin type` : 'Discover products perfect for your skin'}
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="mb-8 space-y-3">
          <div>
            <p className="font-jost mb-2" style={{ fontSize: 11, color: '#9AAA9A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <FilterChip key={cat} value={cat} current={selectedCategory} onChange={setSelectedCategory}
                  label={cat === 'all' ? 'All' : cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} />
              ))}
            </div>
          </div>
          <div>
            <p className="font-jost mb-2" style={{ fontSize: 11, color: '#9AAA9A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Skin Type</p>
            <div className="flex flex-wrap gap-2">
              {skinTypes.map((type) => (
                <FilterChip key={type} value={type} current={selectedSkinType} onChange={setSelectedSkinType}
                  label={type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)} />
              ))}
            </div>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse" style={{ background: '#E8EFE8', borderRadius: 3, height: 280 }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <AnimatedSection key={product.id} delay={i * 0.04}>
                <ProductCard product={product} onQuickView={setModalProduct} />
              </AnimatedSection>
            ))}
          </div>
        )}

        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} userConcerns={profile?.skin_concerns || []} />
      </div>
    </PageTransition>
  );
}