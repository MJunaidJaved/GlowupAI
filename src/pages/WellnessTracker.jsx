import { api } from '../api/client'
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, subDays, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import PageTransition from '../components/shared/PageTransition';
import AnimatedSection from '../components/shared/AnimatedSection';
import { Plus, Minus } from 'lucide-react';

const GOAL_WATER = 8;
const GOAL_SLEEP = 8;

export default function WellnessTracker() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const today = format(new Date(), 'yyyy-MM-dd');
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState('okay');

  useEffect(() => { api.get('/api/auth/me').then(setUser).catch(() => {}); }, []);

  const { data: logs = [] } = useQuery({
    queryKey: ['wellnessLogs', user?.email],
    queryFn: () => user ? api.get('/api/wellness') : [],
    enabled: !!user,
  });

  const todayLog = logs.find((l) => l.log_date === today);
  const currentWater = todayLog?.water_glasses ?? 0;

  const waterMutation = useMutation({
    mutationFn: async (newGlasses) => {
      return api.post('/api/wellness', {
        log_date: today,
        water_glasses: newGlasses,
        sleep_hours: todayLog?.sleep_hours ?? sleepHours,
        sleep_quality: todayLog?.sleep_quality ?? sleepQuality
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wellnessLogs', user?.email] }),
  });

  const sleepMutation = useMutation({
    mutationFn: () => {
      return api.post('/api/wellness', {
        log_date: today,
        water_glasses: currentWater,
        sleep_hours: sleepHours,
        sleep_quality: sleepQuality
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wellnessLogs', user?.email] }),
  });

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const log = logs.find((l) => l.log_date === d);
    return { day: format(parseISO(d), 'EEE'), water: log?.water_glasses ?? 0, sleep: log?.sleep_hours ?? 0 };
  });

  const avgSleep = logs.length ? (logs.reduce((a, l) => a + (l.sleep_hours || 0), 0) / logs.length).toFixed(1) : 0;
  const bestWaterDay = last7.reduce((a, b) => (b.water > a.water ? b : a), last7[0]);
  const streak = (() => {
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      if (logs.find((l) => l.log_date === d)) s++;
      else break;
    }
    return s;
  })();

  const cardStyle = { background: '#fff', border: '1px solid #E2E8E2', borderRadius: 3, boxShadow: '0 2px 16px rgba(61,90,62,0.08)', padding: 32 };
  const labelStyle = { fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A', fontFamily: 'var(--font-jost)', fontWeight: 500 };
  const sliderPct = (sleepHours / 12) * 100;

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8 lg:p-10" style={{ background: '#F7F7F5' }}>
        <AnimatedSection>
          <p className="font-jost font-medium uppercase mb-1" style={labelStyle}>Daily Habits</p>
          <h1 className="font-cormorant font-semibold mb-8" style={{ fontSize: 40, color: '#1A1F1A', lineHeight: 1.2 }}>
            Wellness Tracker
          </h1>
        </AnimatedSection>

        {/* Water + Sleep cards */}
        <AnimatedSection delay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Water card */}
          <div style={cardStyle}>
            <p className="font-jost font-medium uppercase mb-2" style={labelStyle}>Daily Hydration</p>
            <h2 className="font-cormorant font-semibold mb-6" style={{ fontSize: 22, color: '#1A1F1A' }}>Water Intake</h2>

            {/* Glass icons — 2 rows of 4 */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {Array.from({ length: GOAL_WATER }, (_, i) => (
                <motion.button
                  key={i}
                  onClick={() => { if (i < currentWater || currentWater < GOAL_WATER) waterMutation.mutate(i < currentWater ? i : i + 1); }}
                  className="flex items-center justify-center"
                  style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    border: `2px solid ${i < currentWater ? '#3D5A3E' : '#E2E8E2'}`,
                    background: i < currentWater ? '#3D5A3E' : '#fff',
                    transition: 'all 0.15s',
                  }}
                  whileTap={{ scale: 0.9 }}
                  animate={i < currentWater ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {i < currentWater && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </motion.button>
              ))}
            </div>

            <p className="font-jost mb-6" style={{ fontSize: 13, color: '#5C6B5C' }}>
              {currentWater} of {GOAL_WATER} glasses today
            </p>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => { if (currentWater > 0) waterMutation.mutate(currentWater - 1); }}
                className="flex items-center justify-center"
                style={{ width: 32, height: 32, borderRadius: 3, border: '1.5px solid #3D5A3E', color: '#3D5A3E', background: 'transparent' }}
                whileHover={{ background: '#3D5A3E', color: '#fff' }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => { if (currentWater < GOAL_WATER) waterMutation.mutate(currentWater + 1); }}
                className="flex items-center justify-center text-white"
                style={{ width: 32, height: 32, borderRadius: 3, background: '#3D5A3E' }}
                whileHover={{ backgroundColor: '#2C3E2D' }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Sleep card */}
          <div style={cardStyle}>
            <p className="font-jost font-medium uppercase mb-2" style={labelStyle}>Last Night</p>
            <h2 className="font-cormorant font-semibold mb-4" style={{ fontSize: 22, color: '#1A1F1A' }}>Sleep Hours</h2>

            <div className="text-center mb-4">
              <span className="font-cormorant font-semibold" style={{ fontSize: 36, color: '#1A1F1A' }}>{sleepHours}</span>
              <span className="font-jost ml-2" style={{ fontSize: 13, color: '#9AAA9A' }}>hours</span>
            </div>

            <input
              type="range"
              min="0" max="12" step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full green-slider mb-6"
              style={{
                background: `linear-gradient(to right, #3D5A3E 0%, #3D5A3E ${sliderPct}%, #E2E8E2 ${sliderPct}%, #E2E8E2 100%)`,
              }}
            />

            <div className="flex gap-2 mb-6">
              {['poor', 'okay', 'great'].map((q) => (
                <button
                  key={q}
                  onClick={() => setSleepQuality(q)}
                  className="flex-1 font-jost font-medium capitalize transition-all duration-150"
                  style={{
                    padding: '10px',
                    border: sleepQuality === q ? 'none' : '1px solid #E2E8E2',
                    borderRadius: 3,
                    fontSize: 13,
                    background: sleepQuality === q ? '#3D5A3E' : '#fff',
                    color: sleepQuality === q ? '#fff' : '#5C6B5C',
                  }}
                >
                  {q.charAt(0).toUpperCase() + q.slice(1)}
                </button>
              ))}
            </div>

            <motion.button
              onClick={() => sleepMutation.mutate()}
              disabled={sleepMutation.isPending}
              className="w-full font-jost font-semibold tracking-[0.1em] uppercase text-xs text-white"
              style={{ background: sleepMutation.isPending ? '#6B8F6C' : '#3D5A3E', padding: '14px 36px', borderRadius: 3 }}
              whileHover={sleepMutation.isPending ? {} : { backgroundColor: '#2C3E2D', y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {sleepMutation.isPending ? 'Saving...' : 'Log Sleep'}
            </motion.button>
          </div>
        </AnimatedSection>

        {/* Charts */}
        <AnimatedSection delay={0.2} className="mb-4">
          <div style={{ background: '#fff', border: '1px solid #E2E8E2', borderRadius: 3, boxShadow: '0 2px 16px rgba(61,90,62,0.08)' }}>
            <div style={{ padding: '24px 24px 0' }}>
              <p className="font-jost font-medium uppercase mb-1" style={labelStyle}>7-Day Overview</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {[
                { title: 'Water Intake', key: 'water', goal: GOAL_WATER },
                { title: 'Sleep Hours', key: 'sleep', goal: GOAL_SLEEP },
              ].map((chart, i) => (
                <div key={chart.key} style={{ padding: 24, borderLeft: i > 0 ? '1px solid #E2E8E2' : 'none' }}>
                  <h3 className="font-jost font-medium mb-4" style={{ fontSize: 12, color: '#5C6B5C' }}>{chart.title}</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={last7} barSize={16}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9AAA9A', fontFamily: 'Jost' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9AAA9A', fontFamily: 'Jost' }} />
                      <Tooltip contentStyle={{ border: '1px solid #E2E8E2', borderRadius: 3, fontFamily: 'Jost', fontSize: 12 }} />
                      <ReferenceLine y={chart.goal} stroke="#C8A882" strokeDasharray="4 4" strokeWidth={1.5} />
                      <Bar dataKey={chart.key} fill="#3D5A3E" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Insights */}
        <AnimatedSection delay={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Avg Sleep', value: `${avgSleep}`, unit: 'hrs/night' },
              { label: 'Best Hydration', value: bestWaterDay?.day || '—', unit: 'this week' },
              { label: 'Logging Streak', value: `${streak}`, unit: `day${streak !== 1 ? 's' : ''}` },
            ].map((insight, i) => (
              <AnimatedSection key={insight.label} delay={i * 0.06}>
                <motion.div
                  style={{ background: '#fff', border: '1px solid #E2E8E2', borderRadius: 3, padding: 24, boxShadow: '0 2px 16px rgba(61,90,62,0.08)' }}
                  whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(61,90,62,0.14)' }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="font-jost font-medium uppercase mb-2" style={labelStyle}>{insight.label}</p>
                  <span className="font-cormorant font-semibold" style={{ fontSize: 32, color: '#1A1F1A', lineHeight: 1 }}>{insight.value}</span>
                  <p className="font-jost mt-1" style={{ fontSize: 11, color: '#9AAA9A' }}>{insight.unit}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </PageTransition>
  );
}