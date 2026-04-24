import { api } from '../api/client'
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, getDaysInMonth, startOfMonth, getDay, parseISO } from 'date-fns';
import PageTransition from '../components/shared/PageTransition';
import AnimatedSection from '../components/shared/AnimatedSection';
import { X, Check } from 'lucide-react';

const MOODS = [
  { id: 'glowing',     label: 'Glowing'  },
  { id: 'good',        label: 'Good'     },
  { id: 'okay',        label: 'Okay'     },
  { id: 'dry',         label: 'Dry'      },
  { id: 'breaking_out',label: 'Troubled' },
];

function getMood(id) {
  return MOODS.find((m) => m.id === id) || MOODS[1];
}

export default function SkinDiary() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [skinNotes, setSkinNotes] = useState('');
  const [lifestyleNotes, setLifestyleNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [modalEntry, setModalEntry] = useState(null);
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  useEffect(() => { api.get('/api/auth/me').then(setUser).catch(() => {}); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['skinDiary', user?.email],
    queryFn: () => user ? api.get('/api/skin-diary') : [],
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: () => api.post('/api/skin-diary', {
      entry_date: today,
      mood: selectedMood || 'good',
      skin_notes: skinNotes,
      lifestyle_notes: lifestyleNotes,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skinDiary', user?.email] });
      setSaved(true);
      setSkinNotes('');
      setLifestyleNotes('');
      setSelectedMood('');
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const daysInMonth = getDaysInMonth(now);
  const firstDayOfMonth = getDay(startOfMonth(now));
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEntryForDay = (day) => {
    const dateStr = format(new Date(now.getFullYear(), now.getMonth(), day), 'yyyy-MM-dd');
    return entries.find((e) => e.entry_date === dateStr);
  };

  const cardStyle = { background: '#fff', border: '1px solid #E2E8E2', borderRadius: 3, boxShadow: '0 2px 16px rgba(61,90,62,0.08)' };
  const inputStyle = {
    width: '100%', border: '1px solid #E2E8E2', borderRadius: 3,
    padding: '12px 16px', fontFamily: 'var(--font-jost)', fontSize: 14,
    color: '#1A1F1A', outline: 'none', transition: 'border-color 0.2s', resize: 'none',
  };
  const labelStyle = { fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A', fontFamily: 'var(--font-jost)', fontWeight: 500 };

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8 lg:p-10" style={{ background: '#F7F7F5' }}>
        <AnimatedSection>
          <p className="font-jost font-medium uppercase mb-1" style={labelStyle}>Daily Habits</p>
          <h1 className="font-cormorant font-semibold mb-8" style={{ fontSize: 40, color: '#1A1F1A', lineHeight: 1.2 }}>
            Skin Diary
          </h1>
        </AnimatedSection>

        {/* New entry */}
        <AnimatedSection delay={0.1} className="mb-6">
          <div style={{ ...cardStyle, padding: 32 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cormorant font-semibold" style={{ fontSize: 22, color: '#1A1F1A' }}>Today's Skin Entry</h2>
              <span className="font-jost" style={{ fontSize: 11, color: '#9AAA9A' }}>{format(new Date(), 'EEEE, MMMM d')}</span>
            </div>

            {/* Mood selector — text only buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className="font-jost font-medium transition-all duration-150"
                  style={{
                    padding: '10px 20px',
                    border: selectedMood === mood.id ? 'none' : '1px solid #E2E8E2',
                    borderRadius: 3,
                    fontSize: 13,
                    background: selectedMood === mood.id ? '#3D5A3E' : '#fff',
                    color: selectedMood === mood.id ? '#fff' : '#5C6B5C',
                  }}
                >
                  {mood.label}
                </button>
              ))}
            </div>

            <textarea
              value={skinNotes}
              onChange={(e) => setSkinNotes(e.target.value)}
              placeholder="How is your skin today? What did you use?"
              rows={4}
              style={{ ...inputStyle, marginBottom: 12 }}
              onFocus={(e) => { e.target.style.borderColor = '#3D5A3E'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8E2'; }}
            />
            <textarea
              value={lifestyleNotes}
              onChange={(e) => setLifestyleNotes(e.target.value)}
              placeholder="Anything you ate, drank, or did differently today?"
              rows={2}
              style={{ ...inputStyle, marginBottom: 20 }}
              onFocus={(e) => { e.target.style.borderColor = '#3D5A3E'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8E2'; }}
            />

            <AnimatePresence>
              {saved && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex justify-center mb-4">
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
              {saveMutation.isPending ? 'Saving...' : 'Save Entry'}
            </motion.button>
          </div>
        </AnimatedSection>

        {/* Calendar */}
        <AnimatedSection delay={0.2} className="mb-6">
          <div style={{ ...cardStyle, padding: 24 }}>
            <h2 className="font-cormorant font-semibold mb-4" style={{ fontSize: 22, color: '#1A1F1A' }}>
              {format(now, 'MMMM yyyy')}
            </h2>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="text-center font-jost py-1" style={{ fontSize: 11, color: '#9AAA9A' }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
              {calendarDays.map((day) => {
                const entry = getEntryForDay(day);
                const isToday = day === now.getDate();
                return (
                  <motion.div
                    key={day}
                    onClick={() => entry && setModalEntry(entry)}
                    className="flex flex-col items-center py-1.5"
                    style={{
                      cursor: entry ? 'pointer' : 'default',
                      borderRadius: 3,
                      background: isToday ? '#E8EFE8' : 'transparent',
                    }}
                    whileHover={entry ? { backgroundColor: '#E8EFE8' } : {}}
                  >
                    <span className="font-jost" style={{ fontSize: 12, color: isToday ? '#3D5A3E' : '#1A1F1A', fontWeight: isToday ? 600 : 400 }}>{day}</span>
                    {entry && (
                      <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: '#C8A882' }} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Recent entries */}
        <AnimatedSection delay={0.3}>
          <h2 className="font-cormorant font-semibold mb-4" style={{ fontSize: 24, color: '#1A1F1A' }}>Recent Entries</h2>
          <div className="space-y-3">
            {entries.slice(0, 5).map((entry, i) => {
              const mood = getMood(entry.mood);
              return (
                <AnimatedSection key={entry.id} delay={i * 0.05}>
                  <motion.div style={cardStyle} whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(61,90,62,0.14)' }} transition={{ duration: 0.25 }}>
                    <div className="flex items-center justify-between p-4 pb-3">
                      <span className="font-jost font-medium" style={{ fontSize: 11, background: '#E8EFE8', color: '#3D5A3E', padding: '3px 10px', borderRadius: 2 }}>
                        {mood.label}
                      </span>
                      <span className="font-jost" style={{ fontSize: 11, color: '#9AAA9A' }}>
                        {format(parseISO(entry.entry_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {entry.skin_notes && (
                      <p className="font-jost px-4 pb-3 line-clamp-3" style={{ fontSize: 14, color: '#1A1F1A', lineHeight: 1.7 }}>{entry.skin_notes}</p>
                    )}
                    {entry.lifestyle_notes && (
                      <p className="font-jost italic px-4 pb-4" style={{ fontSize: 12, color: '#5C6B5C' }}>{entry.lifestyle_notes}</p>
                    )}
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Modal */}
        <AnimatePresence>
          {modalEntry && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.15)' }}
              onClick={() => setModalEntry(null)}
            >
              <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', damping: 28 }}
                style={{ ...cardStyle, maxWidth: 480, width: '100%', padding: 32 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-cormorant font-semibold" style={{ fontSize: 20, color: '#1A1F1A' }}>
                    {format(parseISO(modalEntry.entry_date), 'MMMM d, yyyy')}
                  </h3>
                  <button onClick={() => setModalEntry(null)}><X className="w-5 h-5" style={{ color: '#9AAA9A' }} /></button>
                </div>
                <span className="font-jost font-medium inline-block mb-4" style={{ fontSize: 11, background: '#E8EFE8', color: '#3D5A3E', padding: '4px 12px', borderRadius: 2 }}>
                  {getMood(modalEntry.mood).label}
                </span>
                {modalEntry.skin_notes && <p className="font-jost mb-3" style={{ fontSize: 14, color: '#1A1F1A', lineHeight: 1.7 }}>{modalEntry.skin_notes}</p>}
                {modalEntry.lifestyle_notes && (
                  <p className="font-jost italic pt-3" style={{ fontSize: 13, color: '#5C6B5C', borderTop: '1px solid #E2E8E2' }}>{modalEntry.lifestyle_notes}</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}