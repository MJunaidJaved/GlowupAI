import { api } from '../../api/client'
import React from 'react';
import { motion } from 'framer-motion';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { format } from 'date-fns';

export default function RoutineChecklist({ routines }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const queryClient = useQueryClient();

  const { data: checklistData } = useQuery({
    queryKey: ['dailyChecklist', today],
    queryFn: () => api.get(`/api/checklist/${today}`),
  });

  const checklist = checklistData?.id ? checklistData : null;
  const completedSteps = checklist?.completed_steps || [];

  const toggleMutation = useMutation({
    mutationFn: async (stepId) => {
      const newSteps = completedSteps.includes(stepId)
        ? completedSteps.filter((s) => s !== stepId)
        : [...completedSteps, stepId];

      if (checklist) {
        return api.put('/api/checklist/' + checklist.id, { completed_steps: newSteps });
      } else {
        return api.post('/api/checklist', { date: today, completed_steps: newSteps });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dailyChecklist'] }),
  });

  const allSteps = routines?.flatMap((r) =>
    (r.steps || []).map((s, i) => ({
      id: `${r.routine_type}-${i}`,
      label: `${s.product_type}: ${s.product_name}`,
      type: r.routine_type,
    }))
  ) || [];

  const totalSteps = allSteps.length;
  const doneCount = completedSteps.length;
  const progress = totalSteps > 0 ? (doneCount / totalSteps) * 100 : 0;

  if (totalSteps === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-glow-sm">
        <p className="font-cormorant text-xs tracking-[0.2em] uppercase text-rose-gold mb-3">Today's Routine</p>
        <p className="font-dm text-warm-gray text-sm">Start a chat to get your personalized routine!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-glow-sm">
      <p className="font-cormorant text-xs tracking-[0.2em] uppercase text-rose-gold mb-4">Today's Routine</p>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {['am', 'pm'].map((type) => {
          const steps = allSteps.filter((s) => s.type === type);
          if (steps.length === 0) return null;
          return (
            <div key={type} className="mb-3">
              <p className="font-dm text-xs font-semibold text-warm-charcoal uppercase mb-2">
                {type === 'am' ? '☀️ Morning' : '🌙 Evening'}
              </p>
              {steps.map((step) => {
                const done = completedSteps.includes(step.id);
                return (
                  <button
                    key={step.id}
                    onClick={() => toggleMutation.mutate(step.id)}
                    className="flex items-center gap-3 w-full py-2 text-left group"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      done ? 'bg-rose-gold border-rose-gold' : 'border-rose-gold/30 group-hover:border-rose-gold'
                    }`}>
                      {done && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <span className={`font-dm text-sm transition-all ${done ? 'line-through text-warm-gray/50' : 'text-warm-charcoal'}`}>
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-2 bg-rose-gold/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-rose-gold rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="font-dm text-xs text-warm-gray mt-2">{doneCount} of {totalSteps} steps done</p>
    </div>
  );
}