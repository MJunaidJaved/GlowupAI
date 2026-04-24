import { api } from '../api/client'
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageTransition from '../components/shared/PageTransition';
import AnimatedSection from '../components/shared/AnimatedSection';
import { Check } from 'lucide-react';

const SLIDERS = [
  { key: 'acne_level', label: 'Acne Level' },
  { key: 'hydration',  label: 'Hydration'  },
  { key: 'glow',       label: 'Glow'       },
  { key: 'redness',    label: 'Redness'    },
  { key: 'texture',    label: 'Texture'    },
  { key: 'dark_spots', label: 'Dark Spots' },
];

function RatingSlider({ label, value, onChange }) {
  const pct = ((value - 1) / 9) * 100;
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-jost font-semibold" style={{ fontSize: 13, color: '#1A1F1A' }}>{label}</span>
        <span className="font-jost font-semibold text-white"
          style={{ fontSize: 11, background: '#3D5A3E', padding: '2px 8px', borderRadius: 2 }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full green-slider"
        style={{
          background: `linear-gradient(to right, #3D5A3E 0%, #3D5A3E ${pct}%, #E2E8E2 ${pct}%, #E2E8E2 100%)`,
        }}
      />
      <div className="flex justify-between font-jost" style={{ fontSize: 11, color: '#9AAA9A', marginTop: 4 }}>
        <span>1</span><span>5</span><span>10</span>
      </div>
    </div>
  );
}

export default function ProgressTracker() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState({ acne_level: 5, hydration: 5, glow: 5, redness: 5, texture: 5, dark_spots: 5 });
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get('/api/auth/me').then(setUser).catch(() => {}); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['glowProgress', user?.email],
    queryFn: () => user ? api.get('/api/glow-progress') : [],
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const weekDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      return api.post('/api/glow-progress', { ...ratings, notes, week_date: weekDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glowProgress', user?.email] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setNotes('');
    },
  });

  const chartData = [...entries].reverse().map((e) => ({
    date: format(new Date(e.week_date), 'MMM d'),
    acne: e.acne_level,
    hydration: e.hydration,
    glow: e.glow,
    redness: e.redness,
    texture: e.texture,
  }));

  const cardStyle = { background: '#fff', border: '1px solid #E2E8E2', borderRadius: 3, boxShadow: '0 2px 16px rgba(61,90,62,0.08)' };
  const labelStyle = { fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A', fontFamily: 'var(--font-jost)', fontWeight: 500 };

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8 lg:p-10" style={{ background: '#F7F7F5' }}>
        <AnimatedSection>
          <p className="font-jost font-medium uppercase mb-1" style={labelStyle}>Weekly Check-In</p>
          <h1 className="font-cormorant font-semibold mb-8" style={{ fontSize: 40, color: '#1A1F1A', lineHeight: 1.2 }}>
            Glow Progress Tracker
          </h1>
        </AnimatedSection>

        {/* Check-in card */}
        <AnimatedSection delay={0.1} className="mb-6">
          <div style={{ ...cardStyle, padding: 40 }}>
            <h2 className="font-cormorant font-semibold mb-8" style={{ fontSize: 26, color: '#1A1F1A' }}>
              How is your skin this week?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
              {SLIDERS.map((s) => (
                <RatingSlider
                  key={s.key}
                  label={s.label}
                  value={ratings[s.key]}
                  onChange={(v) => setRatings((r) => ({ ...r, [s.key]: v }))}
                />
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes this week? (optional)"
              rows={3}
              className="w-full font-jost text-sm resize-none mb-6"
              style={{
                border: '1px solid #E2E8E2',
                borderRadius: 3,
                padding: '12px 16px',
                color: '#1A1F1A',
                outline: 'none',
                minHeight: 80,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#3D5A3E'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8E2'; }}
            />
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center mb-4"
                >
                  <div className="w-10 h-10 flex items-center justify-center" style={{ background: '#E8EFE8', borderRadius: 3 }}>
                    <Check className="w-5 h-5" style={{ color: '#3D5A3E' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full font-jost font-semibold tracking-[0.1em] uppercase text-xs text-white"
              style={{ background: saveMutation.isPending ? '#6B8F6C' : '#3D5A3E', padding: '14px 36px', borderRadius: 3 }}
              whileHover={saveMutation.isPending ? {} : { backgroundColor: '#2C3E2D', y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save This Week\'s Check-In'}
            </motion.button>
          </div>
        </AnimatedSection>

        {/* Charts */}
        <AnimatedSection delay={0.2} className="mb-6">
          {entries.length < 2 ? (
            <div style={{ ...cardStyle, padding: 40, textAlign: 'center' }}>
              <h3 className="font-cormorant font-semibold mb-2" style={{ fontSize: 22, color: '#1A1F1A' }}>
                Check in weekly to see your progress
              </h3>
              <p className="font-jost" style={{ fontSize: 14, color: '#5C6B5C' }}>You need at least 2 check-ins to see charts.</p>
            </div>
          ) : (
            <div style={cardStyle}>
              <div style={{ padding: '24px 24px 0' }}>
                <p className="font-jost font-medium uppercase mb-1" style={labelStyle}>Your Journey</p>
                <h3 className="font-cormorant font-semibold mb-4" style={{ fontSize: 24, color: '#1A1F1A' }}>Progress Over Time</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {[
                  { title: 'Acne Level', keys: [{ key: 'acne', color: '#3D5A3E', label: 'Acne' }] },
                  { title: 'Hydration & Glow', keys: [{ key: 'hydration', color: '#3D5A3E', label: 'Hydration' }, { key: 'glow', color: '#C8A882', label: 'Glow' }] },
                  { title: 'Redness & Texture', keys: [{ key: 'redness', color: '#3D5A3E', label: 'Redness' }, { key: 'texture', color: '#C8A882', label: 'Texture' }] },
                ].map((chart, i) => (
                  <div key={chart.title} style={{ padding: 24, borderLeft: i > 0 ? '1px solid #E2E8E2' : 'none' }}>
                    <h4 className="font-jost font-medium mb-4" style={{ fontSize: 12, color: '#5C6B5C' }}>{chart.title}</h4>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9AAA9A', fontFamily: 'Jost' }} />
                        <YAxis domain={[1, 10]} tick={{ fontSize: 10, fill: '#9AAA9A', fontFamily: 'Jost' }} />
                        <Tooltip contentStyle={{ border: '1px solid #E2E8E2', borderRadius: 3, fontFamily: 'Jost', fontSize: 12 }} />
                        {chart.keys.map((k) => (
                          <Line key={k.key} type="monotone" dataKey={k.key} stroke={k.color} strokeWidth={2} dot={{ fill: k.color, r: 3 }} name={k.label} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnimatedSection>

        {/* History */}
        {entries.length > 0 && (
          <AnimatedSection delay={0.3}>
            <h2 className="font-cormorant font-semibold mb-4" style={{ fontSize: 24, color: '#1A1F1A' }}>Check-In History</h2>
            <div className="space-y-3">
              {entries.map((entry, i) => (
                <AnimatedSection key={entry.id} delay={i * 0.04}>
                  <div style={cardStyle}>
                    <div className="flex items-center justify-between" style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8E2' }}>
                      <span className="font-jost" style={{ fontSize: 11, color: '#9AAA9A' }}>
                        Week of {format(new Date(entry.week_date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4">
                      {SLIDERS.map((s) => (
                        <span key={s.key} className="font-jost"
                          style={{ fontSize: 11, background: '#E8EFE8', color: '#3D5A3E', padding: '2px 8px', borderRadius: 2 }}>
                          {s.label}: {entry[s.key]}
                        </span>
                      ))}
                    </div>
                    {entry.notes && (
                      <p className="font-jost italic px-4 pb-4" style={{ fontSize: 13, color: '#5C6B5C' }}>"{entry.notes}"</p>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        )}
      </div>
    </PageTransition>
  );
}