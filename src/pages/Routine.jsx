import { api } from '../api/client'
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import PageTransition from '../components/shared/PageTransition';
import AnimatedSection from '../components/shared/AnimatedSection';
import { Check, Sun, Moon } from 'lucide-react';

export default function Routine() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    api.get('/api/auth/me').then(setUser).catch(() => {});
  }, []);

  const { data: routines = [] } = useQuery({
    queryKey: ['routines', user?.email],
    queryFn: () => user ? api.get('/api/routine') : [],
    enabled: !!user,
  });

  const { data: checklistData } = useQuery({
    queryKey: ['dailyChecklist', today, user?.email],
    queryFn: () => user ? api.get(`/api/checklist/${today}`) : null,
    enabled: !!user,
  });

  const checklist = checklistData?.id ? checklistData : null;
  const completedSteps = checklist?.completed_steps || [];

  const toggleMutation = useMutation({
    mutationFn: async (stepId) => {
      const newSteps = completedSteps.includes(stepId)
        ? completedSteps.filter((s) => s !== stepId)
        : [...completedSteps, stepId];
      if (checklist) return api.put('/api/checklist/' + checklist.id, { completed_steps: newSteps });
      return api.post('/api/checklist', { date: today, completed_steps: newSteps });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dailyChecklist'] }),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const profile = await api.get('/api/skin-profile');
      if (!profile) return;

      const response = await api.post('/api/chat/generate-routine', {
        skin_type: profile.skin_type,
        concerns: profile.skin_concerns || [],
        goal: profile.beauty_goal
      });

      for (const r of routines) await api.delete('/api/routine/' + r.id);
      if (response.am) await api.post('/api/routine', { routine_type: 'am', steps: response.am.map((s, i) => ({ ...s, order: i + 1 })) });
      if (response.pm) await api.post('/api/routine', { routine_type: 'pm', steps: response.pm.map((s, i) => ({ ...s, order: i + 1 })) });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });

  const amRoutine = routines.find((r) => r.routine_type === 'am');
  const pmRoutine = routines.find((r) => r.routine_type === 'pm');

  const cardStyle = { background: '#fff', border: '1px solid #E2E8E2', borderRadius: 3, boxShadow: '0 2px 16px rgba(61,90,62,0.08)', padding: 32 };
  const labelStyle = { fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A', fontFamily: 'var(--font-jost)', fontWeight: 500 };

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8 lg:p-10" style={{ background: '#F7F7F5' }}>
        <AnimatedSection>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
            <div>
              <p className="font-jost font-medium uppercase mb-1" style={labelStyle}>Daily Routine</p>
              <h1 className="font-cormorant font-semibold" style={{ fontSize: 40, color: '#1A1F1A', lineHeight: 1.2 }}>My Glow Routine</h1>
              <p className="font-jost mt-1" style={{ fontSize: 14, color: '#5C6B5C' }}>Follow these steps daily for your best skin</p>
            </div>
            <motion.button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="font-jost font-semibold tracking-[0.1em] uppercase text-xs text-white flex-shrink-0"
              style={{ background: generateMutation.isPending ? '#6B8F6C' : '#3D5A3E', padding: '14px 28px', borderRadius: 3 }}
              whileHover={generateMutation.isPending ? {} : { backgroundColor: '#2C3E2D', y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {generateMutation.isPending ? 'Generating...' : routines.length ? 'Regenerate Routine' : 'Generate My Routine'}
            </motion.button>
          </div>
        </AnimatedSection>

        {routines.length === 0 && !generateMutation.isPending && (
          <AnimatedSection className="text-center py-20">
            <div className="w-16 h-16 mx-auto flex items-center justify-center mb-6" style={{ background: '#E8EFE8', borderRadius: 3 }}>
              <Sun className="w-7 h-7" style={{ color: '#3D5A3E' }} />
            </div>
            <h3 className="font-cormorant font-semibold mb-2" style={{ fontSize: 24, color: '#1A1F1A' }}>No Routine Yet</h3>
            <p className="font-jost" style={{ fontSize: 14, color: '#5C6B5C' }}>Generate a personalized routine based on your skin profile.</p>
          </AnimatedSection>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[{ routine: amRoutine, label: 'Morning Routine', Icon: Sun, type: 'am' },
            { routine: pmRoutine, label: 'Evening Routine', Icon: Moon, type: 'pm' }].map(({ routine, label, Icon, type }) => {
            if (!routine) return null;
            return (
              <AnimatedSection key={type}>
                <div style={cardStyle}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 flex items-center justify-center" style={{ background: '#E8EFE8', borderRadius: 3 }}>
                      <Icon className="w-5 h-5" style={{ color: '#3D5A3E' }} />
                    </div>
                    <h2 className="font-cormorant font-semibold" style={{ fontSize: 22, color: '#1A1F1A' }}>{label}</h2>
                  </div>
                  <div className="space-y-3">
                    {(routine.steps || []).map((step, i) => {
                      const stepId = `${type}-${i}`;
                      const done = completedSteps.includes(stepId);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-4 p-4"
                          style={{ background: done ? '#E8EFE8' : '#F7F7F5', borderRadius: 3, border: '1px solid #E2E8E2' }}
                        >
                          <button
                            onClick={() => toggleMutation.mutate(stepId)}
                            className="flex items-center justify-center flex-shrink-0 transition-all duration-200"
                            style={{
                              width: 28, height: 28, borderRadius: 3,
                              border: done ? 'none' : '2px solid #E2E8E2',
                              background: done ? '#3D5A3E' : '#fff',
                            }}
                            onMouseEnter={(e) => { if (!done) e.currentTarget.style.borderColor = '#3D5A3E'; }}
                            onMouseLeave={(e) => { if (!done) e.currentTarget.style.borderColor = '#E2E8E2'; }}
                          >
                            {done ? (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Check className="w-3.5 h-3.5 text-white" />
                              </motion.div>
                            ) : (
                              <span className="font-jost text-xs font-semibold" style={{ color: '#9AAA9A' }}>{i + 1}</span>
                            )}
                          </button>
                          <div className="flex-1">
                            <p className="font-jost font-semibold uppercase" style={{ fontSize: 10, color: '#3D5A3E', letterSpacing: '0.12em', marginBottom: 2 }}>{step.product_type || step.product || ''}</p>
                            <p className={`font-jost font-medium text-sm transition-all ${done ? 'line-through opacity-50' : ''}`} style={{ color: '#1A1F1A' }}>
                              {step.product_name || step.name || ''}
                            </p>
                            <p className="font-jost" style={{ fontSize: 12, color: '#5C6B5C', marginTop: 2 }}>{step.instruction || step.duration || ''}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}