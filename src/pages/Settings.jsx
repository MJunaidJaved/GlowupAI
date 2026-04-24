import { api, removeToken } from '../api/client'
import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import PageTransition from '../components/shared/PageTransition';
import AnimatedSection from '../components/shared/AnimatedSection';
import { motion } from 'framer-motion';

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    api.get('/api/auth/me').then((u) => { setUser(u); setFullName(u?.full_name || ''); }).catch(() => {});
  }, []);

  const updateMutation = useMutation({
    mutationFn: (name) => api.put('/api/settings/profile', { full_name: name }),
    onSuccess: () => api.get('/api/auth/me').then(setUser),
  });

  const cardStyle = { background: '#fff', border: '1px solid #E2E8E2', borderRadius: 3, boxShadow: '0 2px 16px rgba(61,90,62,0.08)', padding: 32, marginBottom: 16 };
  const inputStyle = {
    width: '100%', border: '1px solid #E2E8E2', borderRadius: 3,
    padding: '12px 16px', fontFamily: 'var(--font-jost)', fontSize: 14,
    color: '#1A1F1A', outline: 'none', transition: 'border-color 0.2s', background: '#fff',
  };
  const labelStyle = { fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A', fontFamily: 'var(--font-jost)', fontWeight: 500 };

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8 lg:p-10" style={{ background: '#F7F7F5', maxWidth: 740 }}>
        <AnimatedSection>
          <p className="font-jost font-medium uppercase mb-1" style={labelStyle}>Preferences</p>
          <h1 className="font-cormorant font-semibold mb-8" style={{ fontSize: 40, color: '#1A1F1A', lineHeight: 1.2 }}>
            Settings
          </h1>
        </AnimatedSection>

        {/* Profile */}
        <AnimatedSection delay={0.1}>
          <div style={cardStyle}>
            <h2 className="font-cormorant font-semibold mb-6" style={{ fontSize: 22, color: '#1A1F1A' }}>Profile Info</h2>
            <div className="space-y-4">
              <div>
                <label className="font-jost block mb-1.5" style={{ fontSize: 11, color: '#9AAA9A' }}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#3D5A3E'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E2E8E2'; }}
                />
              </div>
              <div>
                <label className="font-jost block mb-1.5" style={{ fontSize: 11, color: '#9AAA9A' }}>Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                />
              </div>
              <motion.button
                onClick={() => updateMutation.mutate(fullName)}
                disabled={updateMutation.isPending}
                className="font-jost font-semibold tracking-[0.1em] uppercase text-xs text-white"
                style={{ background: updateMutation.isPending ? '#6B8F6C' : '#3D5A3E', padding: '14px 36px', borderRadius: 3 }}
                whileHover={updateMutation.isPending ? {} : { backgroundColor: '#2C3E2D', y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </div>
        </AnimatedSection>

        {/* Skin Profile */}
        <AnimatedSection delay={0.2}>
          <div style={cardStyle}>
            <h2 className="font-cormorant font-semibold mb-2" style={{ fontSize: 22, color: '#1A1F1A' }}>Skin Profile</h2>
            <p className="font-jost mb-5" style={{ fontSize: 14, color: '#5C6B5C', lineHeight: 1.7 }}>
              Retake the skin quiz to update your profile and get fresh recommendations.
            </p>
            <motion.button
              onClick={() => navigate('/onboarding')}
              className="font-jost font-semibold tracking-[0.1em] uppercase text-xs"
              style={{ background: 'transparent', color: '#3D5A3E', border: '1.5px solid #3D5A3E', padding: '13px 35px', borderRadius: 3 }}
              whileHover={{ backgroundColor: '#3D5A3E', color: '#fff' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              Retake Skin Quiz
            </motion.button>
          </div>
        </AnimatedSection>

        {/* Account */}
        <AnimatedSection delay={0.3}>
          <div style={cardStyle}>
            <h2 className="font-cormorant font-semibold mb-4" style={{ fontSize: 22, color: '#1A1F1A' }}>Account</h2>
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => { removeToken(); window.location.href = '/login'; }}
                className="font-jost font-semibold tracking-[0.1em] uppercase text-xs"
                style={{ background: 'transparent', color: '#3D5A3E', border: '1.5px solid #3D5A3E', padding: '13px 35px', borderRadius: 3 }}
                whileHover={{ backgroundColor: '#3D5A3E', color: '#fff' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Log Out
              </motion.button>
              <motion.button
                onClick={() => {
                  if (window.confirm('Are you sure? This will permanently delete your account and all data.')) {
                    api.delete('/api/settings/account').then(() => {
                      removeToken();
                      window.location.href = '/login';
                    });
                  }
                }}
                className="font-jost font-semibold tracking-[0.1em] uppercase text-xs"
                style={{ background: 'transparent', color: '#C0392B', border: '1px solid #C0392B', padding: '13px 35px', borderRadius: 3 }}
                whileHover={{ backgroundColor: '#C0392B', color: '#fff' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Delete Account
              </motion.button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </PageTransition>
  );
}