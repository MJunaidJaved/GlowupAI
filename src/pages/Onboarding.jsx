import { api } from '../api/client'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useMutation } from '@tanstack/react-query';
import PageTransition from '../components/shared/PageTransition';
import OnboardingStep1 from '../components/onboarding/StepWelcome';
import OnboardingStep2 from '../components/onboarding/StepSkinType';
import OnboardingStep3 from '../components/onboarding/StepConcerns';
import OnboardingStep4 from '../components/onboarding/StepLifestyle';
import OnboardingStep5 from '../components/onboarding/StepGoals';
import OnboardingComplete from '../components/onboarding/StepComplete';

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [data, setData] = useState({
    skin_type: '',
    skin_concerns: [],
    water_intake: '',
    sleep_hours: '',
    diet_type: '',
    beauty_goal: '',
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    api.get('/api/auth/me').then((user) => {
      setUserName(user?.full_name?.split(' ')[0] || 'There');
    }).catch(() => {});
  }, []);

  const saveMutation = useMutation({
    mutationFn: (profileData) => api.put('/api/skin-profile', { ...profileData, onboarding_complete: true }),
    onSuccess: () => {
      setIsComplete(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    },
  });

  const updateField = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else saveMutation.mutate(data);
  };

  const handleBack = () => { if (step > 1) setStep((s) => s - 1); };

  const progressPercent = (step / TOTAL_STEPS) * 100;

  if (isComplete) return <OnboardingComplete />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        {/* Progress bar — 2px at very top */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-[2px]" style={{ background: '#E2E8E2' }}>
            <motion.div
              className="h-full"
              style={{ background: '#3D5A3E' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          {/* Step count — top right */}
          <div className="absolute top-2 right-4">
            <span className="font-jost" style={{ fontSize: 11, color: '#9AAA9A' }}>
              {step} / {TOTAL_STEPS}
            </span>
          </div>
        </div>

        {/* Step 1: full-screen welcome */}
        {step === 1 && (
          <div className="pt-2">
            <OnboardingStep1 name={userName} onNext={handleNext} />
          </div>
        )}

        {/* Steps 2-5: centered content */}
        {step > 1 && (
          <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-16 pb-12">
            <div className="w-full" style={{ maxWidth: 560 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  {step === 2 && <OnboardingStep2 value={data.skin_type} onChange={(v) => updateField('skin_type', v)} />}
                  {step === 3 && <OnboardingStep3 value={data.skin_concerns} onChange={(v) => updateField('skin_concerns', v)} />}
                  {step === 4 && (
                    <OnboardingStep4
                      water={data.water_intake}
                      sleep={data.sleep_hours}
                      diet={data.diet_type}
                      onWater={(v) => updateField('water_intake', v)}
                      onSleep={(v) => updateField('sleep_hours', v)}
                      onDiet={(v) => updateField('diet_type', v)}
                    />
                  )}
                  {step === 5 && <OnboardingStep5 value={data.beauty_goal} onChange={(v) => updateField('beauty_goal', v)} />}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-10 gap-4">
                <motion.button
                  onClick={handleBack}
                  className="font-jost font-semibold tracking-[0.1em] uppercase text-xs rounded-[3px]"
                  style={{ background: 'transparent', color: '#3D5A3E', border: '1.5px solid #3D5A3E', padding: '13px 35px' }}
                  whileHover={{ backgroundColor: '#3D5A3E', color: '#fff' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={saveMutation.isPending}
                  className="flex-1 font-jost font-semibold tracking-[0.1em] uppercase text-xs text-white rounded-[3px]"
                  style={{ background: '#3D5A3E', padding: '14px 36px', opacity: saveMutation.isPending ? 0.6 : 1 }}
                  whileHover={saveMutation.isPending ? {} : { backgroundColor: '#2C3E2D', y: -1, boxShadow: '0 6px 20px rgba(61,90,62,0.22)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {step === TOTAL_STEPS ? (saveMutation.isPending ? 'Saving...' : 'Complete') : 'Next'}
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}