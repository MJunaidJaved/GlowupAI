import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import PageTransition from '../components/shared/PageTransition';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return; }
        const data = await signup(name, email, password);
        navigate('/onboarding', { replace: true });
      } else {
        const data = await login(email, password);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#F7F7F5' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
          style={{ maxWidth: 420 }}
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="font-cormorant text-3xl font-semibold" style={{ color: '#1A1F1A' }}>
              Glow-Up Advisor
            </h1>
            <p className="font-jost mt-2" style={{ fontSize: 14, color: '#9AAA9A' }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block font-jost text-xs font-medium mb-1.5" style={{ color: '#5C6B5C' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-[3px] font-jost text-sm border focus:outline-none focus:ring-2 focus:ring-[#3D5A3E]/30"
                  style={{ background: '#fff', borderColor: '#E2E8E2', color: '#1A1F1A' }}
                />
              </div>
            )}

            <div>
              <label className="block font-jost text-xs font-medium mb-1.5" style={{ color: '#5C6B5C' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-[3px] font-jost text-sm border focus:outline-none focus:ring-2 focus:ring-[#3D5A3E]/30"
                style={{ background: '#fff', borderColor: '#E2E8E2', color: '#1A1F1A' }}
              />
            </div>

            <div>
              <label className="block font-jost text-xs font-medium mb-1.5" style={{ color: '#5C6B5C' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'At least 8 characters' : 'Your password'}
                required
                className="w-full px-4 py-3 rounded-[3px] font-jost text-sm border focus:outline-none focus:ring-2 focus:ring-[#3D5A3E]/30"
                style={{ background: '#fff', borderColor: '#E2E8E2', color: '#1A1F1A' }}
              />
            </div>

            {error && (
              <p className="font-jost text-sm" style={{ color: '#c0392b' }}>{error}</p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full font-jost font-semibold tracking-[0.1em] uppercase text-xs text-white rounded-[3px]"
              style={{ background: '#3D5A3E', padding: '14px 36px', opacity: loading ? 0.6 : 1 }}
              whileHover={!loading ? { backgroundColor: '#2C3E2D', y: -1, boxShadow: '0 6px 20px rgba(61,90,62,0.22)' } : {}}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Log In'}
            </motion.button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 font-jost text-sm" style={{ color: '#5C6B5C' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="font-semibold"
              style={{ color: '#3D5A3E' }}
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
