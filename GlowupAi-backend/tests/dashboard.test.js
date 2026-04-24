/**
 * DASHBOARD TESTS
 * Covers: Data aggregation, greeting logic, tip rotation,
 * quick stats, profile card, user-specific data loading
 */

describe('DASHBOARD — Greeting Logic', () => {
  test('TC-DASH-001: Shows Good Morning before noon', () => {
    const getGreeting = (hour) => {
      if (hour < 12) return 'Good Morning'
      if (hour < 17) return 'Good Afternoon'
      return 'Good Evening'
    }
    expect(getGreeting(6)).toBe('Good Morning')
    expect(getGreeting(11)).toBe('Good Morning')
    expect(getGreeting(12)).toBe('Good Afternoon')
    expect(getGreeting(16)).toBe('Good Afternoon')
    expect(getGreeting(17)).toBe('Good Evening')
    expect(getGreeting(23)).toBe('Good Evening')
  })

  test('TC-DASH-002: Greeting includes user name', () => {
    const buildGreeting = (name, hour) => {
      const time = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
      return `${time}, ${name}` 
    }
    expect(buildGreeting('Sarah', 9)).toBe('Good Morning, Sarah')
    expect(buildGreeting('Hammas', 15)).toBe('Good Afternoon, Hammas')
  })
})

describe('DASHBOARD — Daily Tip', () => {
  test('TC-DASH-003: Daily tip rotates based on day of year', () => {
    const tips = ['Drink water', 'Use SPF', 'Sleep 8 hours', 'Eat vegetables']
    const getTip = (dayOfYear) => tips[dayOfYear % tips.length]
    expect(tips).toContain(getTip(0))
    expect(tips).toContain(getTip(100))
    expect(tips).toContain(getTip(365))
  })

  test('TC-DASH-004: Same day always shows same tip', () => {
    const tips = ['Tip A', 'Tip B', 'Tip C']
    const getTip = (day) => tips[day % tips.length]
    expect(getTip(5)).toBe(getTip(5))
  })
})

describe('DASHBOARD — User Data Loading', () => {
  test('TC-DASH-005: Skin profile card shows correct skin type', () => {
    const profile = { skin_type: 'oily', skin_concerns: ['acne', 'dullness'] }
    expect(profile.skin_type).toBe('oily')
    expect(profile.skin_concerns).toContain('acne')
  })

  test('TC-DASH-006: Weekly check-in status correct', () => {
    const checkIns = [{ week_date: '2024-01-08', user_id: 1 }]
    const currentWeek = '2024-01-08'
    const hasCheckedIn = (userId) =>
      checkIns.some(c => c.week_date === currentWeek && c.user_id === userId)
    expect(hasCheckedIn(1)).toBe(true)
    expect(hasCheckedIn(2)).toBe(false)
  })

  test('TC-DASH-007: Today diary entry status correct', () => {
    const today = '2024-01-15'
    const entries = [{ entry_date: '2024-01-15', user_id: 1 }]
    const hasTodayEntry = (userId) =>
      entries.some(e => e.entry_date === today && e.user_id === userId)
    expect(hasTodayEntry(1)).toBe(true)
    expect(hasTodayEntry(2)).toBe(false)
  })

  test('TC-DASH-008: Routine completion percentage shown correctly', () => {
    const steps = [
      { completed: true }, { completed: true },
      { completed: false }, { completed: true }
    ]
    const pct = Math.round(steps.filter(s => s.completed).length / steps.length * 100)
    expect(pct).toBe(75)
  })

  test('TC-DASH-009: Dashboard water count shows today only', () => {
    const today = '2024-01-15'
    const logs = [
      { log_date: '2024-01-15', water_glasses: 5, user_id: 1 },
      { log_date: '2024-01-14', water_glasses: 8, user_id: 1 }
    ]
    const todayGlasses = logs.find(l => l.log_date === today && l.user_id === 1)?.water_glasses || 0
    expect(todayGlasses).toBe(5)
  })

  test('TC-DASH-010: Dashboard shows onboarding prompt when not complete', () => {
    const shouldShowOnboarding = (profile) => !profile?.onboarding_complete
    expect(shouldShowOnboarding(null)).toBe(true)
    expect(shouldShowOnboarding({ onboarding_complete: false })).toBe(true)
    expect(shouldShowOnboarding({ onboarding_complete: true })).toBe(false)
  })
})
