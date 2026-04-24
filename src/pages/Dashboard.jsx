import { api } from '../api/client'
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, startOfWeek } from 'date-fns';
import PageTransition from '../components/shared/PageTransition';
import AnimatedSection from '../components/shared/AnimatedSection';
import { TrendingUp, BookOpen, Plus, Droplets } from 'lucide-react';

function DashCard({ children, className = '' }) {
  return (
    <motion.div
      className={`bg-white ${className}`}
      style={{ border: '1px solid #E2E8E2', borderRadius: 3, padding: 24, boxShadow: '0 2px 16px rgba(61,90,62,0.08)' }}
      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(61,90,62,0.14)' }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('Hello');
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    api.get('/api/auth/me').then(setUser).catch(() => {});
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ['skinProfile', user?.email],
    queryFn: () => api.get('/api/skin-profile').then(p => [p]),
    enabled: !!user,
  });
  const { data: routines = [] } = useQuery({
    queryKey: ['routines', user?.email],
    queryFn: () => api.get('/api/routine'),
    enabled: !!user,
  });
  const { data: checklistData } = useQuery({
    queryKey: ['dailyChecklist', today, user?.email],
    queryFn: () => api.get(`/api/checklist/${today}`),
    enabled: !!user,
  });
  const { data: progressEntries = [] } = useQuery({
    queryKey: ['glowProgress', user?.email],
    queryFn: () => api.get('/api/glow-progress'),
    enabled: !!user,
  });
  const { data: diaryEntries = [] } = useQuery({
    queryKey: ['skinDiary', user?.email],
    queryFn: () => api.get('/api/skin-diary'),
    enabled: !!user,
  });
  const { data: wellnessLogs = [] } = useQuery({
    queryKey: ['wellnessLogs', user?.email],
    queryFn: () => api.get('/api/wellness'),
    enabled: !!user,
  });

  const waterMutation = useMutation({
    mutationFn: async () => {
      const todayLog = wellnessLogs.find((l) => l.log_date === today);
      const newGlasses = (todayLog?.water_glasses || 0) + 1;
      if (newGlasses > 8) return; // DB CHECK constraint limit
      return api.post('/api/wellness', {
        log_date: today,
        water_glasses: newGlasses,
        sleep_hours: todayLog?.sleep_hours || 7,
        sleep_quality: todayLog?.sleep_quality || 'okay'
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wellnessLogs', user?.email] }),
  });

  const profile = profiles[0];
  const checklist = checklistData?.id ? checklistData : null;
  const completedSteps = checklist?.completed_steps || [];
  const totalSteps = routines.reduce((acc, r) => acc + (r.steps?.length || 0), 0);
  const completionPct = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;
  const weekDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const thisWeekCheck = progressEntries.find((e) => e.week_date === weekDate);
  const latestDiary = diaryEntries[0];
  const todayLog = wellnessLogs.find((l) => l.log_date === today);
  const currentWater = todayLog?.water_glasses || 0;
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const dateStr = format(new Date(), 'EEEE, MMMM d');

  // Personalized daily tip based on user profile
  const dailyTip = (() => {
    if (!profile) return { title: 'Complete your profile', text: 'Fill out your skin profile to get personalized daily tips tailored to your skin type and goals.' };
    const tips = [];
    if (profile.skin_type === 'oily') tips.push({ title: 'Oil control starts gentle', text: 'Skip harsh cleansers — they trigger more oil. Use a gentle foaming cleanser and niacinamide serum to balance oil production without stripping your skin.' });
    if (profile.skin_type === 'dry') tips.push({ title: 'Lock in that moisture', text: 'Apply moisturizer within 60 seconds of washing while skin is still damp. Layer hyaluronic acid serum underneath for deep hydration that lasts all day.' });
    if (profile.skin_type === 'sensitive') tips.push({ title: 'Less is more', text: 'Stick to minimal, fragrance-free products. Patch test everything and introduce only one new product at a time with at least a week between each.' });
    if (profile.skin_type === 'combination') tips.push({ title: 'Zone-specific care', text: 'Use a gentle cleanser for the whole face, but apply lighter moisturizer on your T-zone and richer cream on dry cheeks. Blotting papers can help midday shine.' });
    if ((profile.skin_concerns || []).includes('acne')) tips.push({ title: 'Don\'t pick — treat instead', text: 'Picking spreads bacteria and causes scarring. Apply a salicylic acid spot treatment and keep hands off. Clean pillowcases weekly to prevent breakouts.' });
    if ((profile.skin_concerns || []).includes('dark_spots')) tips.push({ title: 'Sunscreen is your best friend', text: 'Dark spots darken with UV exposure. Wear SPF 50 daily, even indoors, and add a vitamin C serum in the morning to brighten existing hyperpigmentation.' });
    if ((profile.skin_concerns || []).includes('fine_lines')) tips.push({ title: 'Retinol at night, SPF by day', text: 'Start with a low-strength retinol 2-3 nights per week. Always follow with SPF the next morning — retinol makes skin more sun-sensitive.' });
    if (currentWater < 6) tips.push({ title: 'Hydrate from within', text: `You've had ${currentWater} glasses today — aim for 8! Dehydrated skin looks dull and shows more fine lines. Set hourly water reminders.` });
    if (tips.length === 0) tips.push({ title: 'Consistency is key', text: `Your ${profile.skin_type || ''} skin thrives on routine. Stick to your AM/PM regimen daily and you'll see results in 4-6 weeks. Don't skip sunscreen!` });
    return tips[Math.floor(new Date().getDate() * 7 + new Date().getHours()) % tips.length];
  })();

  const MOODS = {
    glowing: { label: 'Glowing', color: '#3D5A3E' },
    good: { label: 'Good', color: '#6B8F6C' },
    okay: { label: 'Okay', color: '#9AAA9A' },
    dry: { label: 'Dry', color: '#C8A882' },
    breaking_out: { label: 'Troubled', color: '#5C6B5C' }
  };

  const labelStyle = { fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A', fontFamily: 'var(--font-jost)' };
  const cardTitleStyle = { fontSize: 20, color: '#1A1F1A', fontFamily: 'var(--font-cormorant)', fontWeight: 600 };
  const metricStyle = { fontSize: 44, color: '#1A1F1A', fontFamily: 'var(--font-cormorant)', fontWeight: 600, lineHeight: 1 };

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-8 lg:p-10" style={{ background: '#F7F7F5' }}>
        <motion.div className="mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="font-jost font-medium uppercase mb-1" style={labelStyle}>Your Skin</p>
          <h1 className="font-cormorant font-semibold" style={{ fontSize: 34, color: '#1A1F1A' }}>
            {greeting}, {firstName}
          </h1>
          <p className="font-jost" style={{ fontSize: 13, color: '#9AAA9A' }}>{dateStr}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <AnimatedSection delay={0.05}>
            <DashCard>
              <p className="font-jost font-medium uppercase mb-3" style={labelStyle}>Skin Profile</p>
              {profile ? (
                <>
                  <h3 className="font-cormorant font-semibold capitalize mb-2" style={cardTitleStyle}>{profile.skin_type} Skin</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(profile.skin_concerns || []).slice(0, 4).map((c) => (
                      <span key={c} className="font-jost capitalize"
                        style={{ fontSize: 11, background: '#E8EFE8', color: '#3D5A3E', padding: '3px 10px', borderRadius: 2 }}>
                        {c.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => navigate('/settings')} className="font-jost text-xs transition-colors"
                    style={{ color: '#3D5A3E' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#2C3E2D'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#3D5A3E'; }}>
                    Edit Profile →
                  </button>
                </>
              ) : (
                <button onClick={() => navigate('/onboarding')} className="font-jost text-sm font-medium"
                  style={{ color: '#3D5A3E' }}>Complete your skin profile →</button>
              )}
            </DashCard>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <DashCard>
              <p className="font-jost font-medium uppercase mb-3" style={labelStyle}>Daily Tip</p>
              <h3 className="font-cormorant font-semibold mb-2" style={cardTitleStyle}>{dailyTip.title}</h3>
              <p className="font-jost" style={{ fontSize: 14, color: '#5C6B5C', lineHeight: 1.7 }}>
                {dailyTip.text}
              </p>
            </DashCard>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <AnimatedSection delay={0.15}>
            <DashCard>
              <p className="font-jost font-medium uppercase mb-3" style={labelStyle}>Today's Routine</p>
              <div className="flex items-end justify-between mb-3">
                <span className="font-cormorant font-semibold" style={metricStyle}>{completionPct}<span style={{ fontSize: 22, color: '#9AAA9A' }}>%</span></span>
                <span className="font-jost" style={{ fontSize: 11, color: '#9AAA9A' }}>{completedSteps.length}/{totalSteps} steps</span>
              </div>
              <div className="w-full h-[3px] rounded-full overflow-hidden mb-4" style={{ background: '#E2E8E2' }}>
                <motion.div
                  className="h-full"
                  style={{ background: '#3D5A3E', borderRadius: 2 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <button onClick={() => navigate('/routine')} className="font-jost text-xs transition-colors"
                style={{ color: '#3D5A3E' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#2C3E2D'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#3D5A3E'; }}>
                View Full Routine →
              </button>
            </DashCard>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <DashCard>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" style={{ color: '#3D5A3E' }} />
                <p className="font-jost font-medium uppercase" style={labelStyle}>Glow Check-In</p>
              </div>
              {thisWeekCheck ? (
                <>
                  <p className="font-jost mb-2" style={{ fontSize: 12, color: '#9AAA9A' }}>This week's average rating</p>
                  <span className="font-cormorant font-semibold" style={metricStyle}>
                    {(([thisWeekCheck.acne_level, thisWeekCheck.hydration, thisWeekCheck.glow, thisWeekCheck.redness, thisWeekCheck.texture, thisWeekCheck.dark_spots].filter(Boolean).reduce((a, b) => a + b, 0)) / 6).toFixed(1)}
                    <span style={{ fontSize: 18, color: '#9AAA9A' }}>/10</span>
                  </span>
                </>
              ) : (
                <>
                  <p className="font-jost mb-4" style={{ fontSize: 14, color: '#5C6B5C' }}>No check-in this week yet.</p>
                  <button onClick={() => navigate('/progress')}
                    className="font-jost font-semibold tracking-[0.1em] uppercase text-xs text-white rounded-[3px]"
                    style={{ background: '#3D5A3E', padding: '10px 20px' }}>
                    Check In Now
                  </button>
                </>
              )}
            </DashCard>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatedSection delay={0.25}>
            <DashCard>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4" style={{ color: '#3D5A3E' }} />
                <p className="font-jost font-medium uppercase" style={labelStyle}>Skin Diary</p>
              </div>
              {latestDiary ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-jost" style={{ fontSize: 11, background: '#E8EFE8', color: '#3D5A3E', padding: '3px 10px', borderRadius: 2 }}>
                      {MOODS[latestDiary.mood]?.label || 'Good'}
                    </span>
                    <span className="font-jost" style={{ fontSize: 11, color: '#9AAA9A' }}>{latestDiary.entry_date}</span>
                  </div>
                  <p className="font-jost line-clamp-2" style={{ fontSize: 14, color: '#5C6B5C', lineHeight: 1.7 }}>{latestDiary.skin_notes}</p>
                </>
              ) : null}
              <button onClick={() => navigate('/diary')} className="font-jost text-xs transition-colors mt-3 block"
                style={{ color: '#3D5A3E' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#2C3E2D'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#3D5A3E'; }}>
                {latestDiary ? "Write Today's Entry →" : 'Start Your Diary →'}
              </button>
            </DashCard>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <DashCard>
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-4 h-4" style={{ color: '#3D5A3E' }} />
                <p className="font-jost font-medium uppercase" style={labelStyle}>Today's Wellness</p>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <span className="font-cormorant font-semibold" style={metricStyle}>{currentWater}</span>
                  <p className="font-jost uppercase" style={{ fontSize: 11, letterSpacing: '0.1em', color: '#9AAA9A' }}>Glasses</p>
                </div>
                <div>
                  <span className="font-cormorant font-semibold" style={metricStyle}>{todayLog?.sleep_hours || '—'}</span>
                  <p className="font-jost uppercase" style={{ fontSize: 11, letterSpacing: '0.1em', color: '#9AAA9A' }}>Hrs Sleep</p>
                </div>
                <motion.button
                  onClick={() => waterMutation.mutate()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto w-10 h-10 flex items-center justify-center text-white"
                  style={{ background: '#3D5A3E', borderRadius: 3 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
              <button onClick={() => navigate('/wellness')} className="font-jost text-xs transition-colors mt-4 block"
                style={{ color: '#3D5A3E' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#2C3E2D'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#3D5A3E'; }}>
                View Full Tracker →
              </button>
            </DashCard>
          </AnimatedSection>
        </div>
      </div>
    </PageTransition>
  );
}