/**
 * PROGRESS TRACKER TESTS
 * Covers: Check-in saving, loading, validation,
 * chart data calculation, history, user isolation, averages
 */

const USER_ID = 201
let checkIns = []
const resetDb = () => { checkIns = [] }

const saveCheckIn = (userId, data) => {
  const idx = checkIns.findIndex(
    c => c.user_id === userId && c.week_date === data.week_date
  )
  if (idx >= 0) {
    checkIns[idx] = { ...checkIns[idx], ...data }
  } else {
    checkIns.push({ user_id: userId, ...data, created_at: new Date().toISOString() })
  }
  return checkIns.find(c => c.user_id === userId && c.week_date === data.week_date)
}

// ─── CHECK-IN VALIDATION ──────────────────────────────────────────────────────

describe('PROGRESS TRACKER — Validation', () => {
  test('TC-PRG-001: week_date is required', () => {
    const isValid = (data) => !!data.week_date
    expect(isValid({ week_date: null })).toBe(false)
    expect(isValid({ week_date: '2024-01-08' })).toBe(true)
  })

  test('TC-PRG-002: All slider values must be between 1 and 10', () => {
    const isValidRating = (v) => Number.isInteger(v) && v >= 1 && v <= 10
    expect(isValidRating(0)).toBe(false)
    expect(isValidRating(11)).toBe(false)
    expect(isValidRating(-1)).toBe(false)
    expect(isValidRating(1)).toBe(true)
    expect(isValidRating(5)).toBe(true)
    expect(isValidRating(10)).toBe(true)
  })

  test('TC-PRG-003: All six metrics must be present for valid check-in', () => {
    const isValidCheckIn = (data) => {
      const required = ['acne_level', 'hydration', 'glow', 'redness', 'texture', 'dark_spots']
      return required.every(field => data[field] >= 1 && data[field] <= 10)
    }
    const valid = { acne_level: 5, hydration: 7, glow: 6, redness: 4, texture: 5, dark_spots: 3 }
    expect(isValidCheckIn(valid)).toBe(true)
    expect(isValidCheckIn({ ...valid, acne_level: 0 })).toBe(false)
    expect(isValidCheckIn({ ...valid, hydration: 11 })).toBe(false)
  })

  test('TC-PRG-004: Notes field is optional', () => {
    const isValidCheckIn = (data) => {
      const required = ['week_date', 'acne_level', 'hydration', 'glow', 'redness', 'texture', 'dark_spots']
      return required.every(f => data[f] != null)
    }
    const noNotes = {
      week_date: '2024-01-08',
      acne_level: 5, hydration: 7, glow: 6, redness: 4, texture: 5, dark_spots: 3
    }
    expect(isValidCheckIn(noNotes)).toBe(true)
  })

  test('TC-PRG-005: week_date must be in YYYY-MM-DD format', () => {
    const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d)
    expect(isValidDate('2024-01-08')).toBe(true)
    expect(isValidDate('08-01-2024')).toBe(false)
    expect(isValidDate('2024/01/08')).toBe(false)
    expect(isValidDate('not-a-date')).toBe(false)
  })
})

// ─── SAVING AND LOADING ───────────────────────────────────────────────────────

describe('PROGRESS TRACKER — Saving and Loading', () => {
  beforeEach(resetDb)

  test('TC-PRG-006: Check-in saved with user_id', () => {
    saveCheckIn(USER_ID, { week_date: '2024-01-08', acne_level: 6, hydration: 7, glow: 5, redness: 4, texture: 6, dark_spots: 3 })
    const saved = checkIns.find(c => c.user_id === USER_ID)
    expect(saved).toBeDefined()
    expect(saved.user_id).toBe(USER_ID)
  })

  test('TC-PRG-007: Check-in upsert updates same week without creating duplicate', () => {
    saveCheckIn(USER_ID, { week_date: '2024-01-08', acne_level: 6, hydration: 7, glow: 5, redness: 4, texture: 6, dark_spots: 3 })
    saveCheckIn(USER_ID, { week_date: '2024-01-08', acne_level: 4, hydration: 8, glow: 7, redness: 3, texture: 5, dark_spots: 2 })
    const userCheckIns = checkIns.filter(c => c.user_id === USER_ID && c.week_date === '2024-01-08')
    expect(userCheckIns).toHaveLength(1)
    expect(userCheckIns[0].acne_level).toBe(4)
  })

  test('TC-PRG-008: Multiple weeks create separate records', () => {
    saveCheckIn(USER_ID, { week_date: '2024-01-08', acne_level: 6, hydration: 7, glow: 5, redness: 4, texture: 6, dark_spots: 3 })
    saveCheckIn(USER_ID, { week_date: '2024-01-15', acne_level: 4, hydration: 8, glow: 7, redness: 3, texture: 5, dark_spots: 2 })
    expect(checkIns.filter(c => c.user_id === USER_ID)).toHaveLength(2)
  })

  test('TC-PRG-009: Check-ins sorted by week_date descending', () => {
    saveCheckIn(USER_ID, { week_date: '2024-01-01', acne_level: 8, hydration: 5, glow: 4, redness: 7, texture: 6, dark_spots: 5 })
    saveCheckIn(USER_ID, { week_date: '2024-01-15', acne_level: 4, hydration: 8, glow: 7, redness: 3, texture: 5, dark_spots: 2 })
    saveCheckIn(USER_ID, { week_date: '2024-01-08', acne_level: 6, hydration: 7, glow: 5, redness: 4, texture: 6, dark_spots: 3 })
    const sorted = checkIns
      .filter(c => c.user_id === USER_ID)
      .sort((a, b) => new Date(b.week_date) - new Date(a.week_date))
    expect(sorted[0].week_date).toBe('2024-01-15')
    expect(sorted[2].week_date).toBe('2024-01-01')
  })

  test('TC-PRG-010: Empty state when user has no check-ins', () => {
    const userCheckIns = checkIns.filter(c => c.user_id === USER_ID)
    expect(userCheckIns).toHaveLength(0)
  })

  test('TC-PRG-011: Only loads check-ins for current user', () => {
    saveCheckIn(USER_ID, { week_date: '2024-01-08', acne_level: 6, hydration: 7, glow: 5, redness: 4, texture: 6, dark_spots: 3 })
    saveCheckIn(999, { week_date: '2024-01-08', acne_level: 3, hydration: 4, glow: 5, redness: 6, texture: 7, dark_spots: 8 })
    const userCheckIns = checkIns.filter(c => c.user_id === USER_ID)
    expect(userCheckIns).toHaveLength(1)
    expect(userCheckIns.find(c => c.user_id === 999)).toBeUndefined()
  })
})

// ─── CALCULATIONS ─────────────────────────────────────────────────────────────

describe('PROGRESS TRACKER — Calculations', () => {
  test('TC-PRG-012: Weekly average calculated correctly', () => {
    const values = [5, 7, 6, 8, 5]
    const avg = values.reduce((s, v) => s + v, 0) / values.length
    expect(avg).toBe(6.2)
  })

  test('TC-PRG-013: Progress vs previous week calculated', () => {
    const prev = 5
    const curr = 7
    const change = curr - prev
    expect(change).toBe(2)
  })

  test('TC-PRG-014: Best week identified correctly', () => {
    const weeks = [
      { week_date: '2024-01-01', avg: 5 },
      { week_date: '2024-01-08', avg: 7 },
      { week_date: '2024-01-15', avg: 6 }
    ]
    const best = weeks.reduce((max, w) => w.avg > max.avg ? w : max, weeks[0])
    expect(best.week_date).toBe('2024-01-08')
  })

  test('TC-PRG-015: Worst week identified correctly', () => {
    const weeks = [
      { week_date: '2024-01-01', avg: 5 },
      { week_date: '2024-01-08', avg: 7 },
      { week_date: '2024-01-15', avg: 6 }
    ]
    const worst = weeks.reduce((min, w) => w.avg < min.avg ? w : min, weeks[0])
    expect(worst.week_date).toBe('2024-01-01')
  })
})
