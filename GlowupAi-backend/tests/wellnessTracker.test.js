/**
 * WELLNESS TRACKER TESTS
 * Covers: Water intake, sleep logging, validations,
 * weekly calculations, streak, insights, upsert logic
 */

const USER_ID = 401
let logs = []
const resetDb = () => { logs = [] }

const saveLog = (userId, data) => {
  const idx = logs.findIndex(l => l.user_id === userId && l.log_date === data.log_date)
  if (idx >= 0) {
    logs[idx] = { ...logs[idx], ...data }
  } else {
    logs.push({ id: logs.length + 1, user_id: userId, ...data })
  }
  return logs.find(l => l.user_id === userId && l.log_date === data.log_date)
}

// ─── WATER INTAKE ─────────────────────────────────────────────────────────────

describe('WELLNESS TRACKER — Water Intake', () => {
  beforeEach(resetDb)

  test('TC-WELL-001: Adding glass increments count', () => {
    let glasses = 0
    const addGlass = () => { if (glasses < 8) glasses++ }
    addGlass(); addGlass(); addGlass()
    expect(glasses).toBe(3)
  })

  test('TC-WELL-002: Cannot exceed 8 glasses', () => {
    let glasses = 8
    const addGlass = () => { if (glasses < 8) glasses++ }
    addGlass()
    expect(glasses).toBe(8)
  })

  test('TC-WELL-003: Removing glass decrements count', () => {
    let glasses = 5
    const removeGlass = () => { if (glasses > 0) glasses-- }
    removeGlass()
    expect(glasses).toBe(4)
  })

  test('TC-WELL-004: Cannot go below 0 glasses', () => {
    let glasses = 0
    const removeGlass = () => { if (glasses > 0) glasses-- }
    removeGlass()
    expect(glasses).toBe(0)
  })

  test('TC-WELL-005: Water progress percentage correct', () => {
    const getProgress = (current, goal) => Math.min((current / goal) * 100, 100)
    expect(getProgress(0, 8)).toBe(0)
    expect(getProgress(4, 8)).toBe(50)
    expect(getProgress(8, 8)).toBe(100)
    expect(getProgress(10, 8)).toBe(100)
  })

  test('TC-WELL-006: Water glasses value must be 0 to 8', () => {
    const isValid = (g) => Number.isInteger(g) && g >= 0 && g <= 8
    expect(isValid(-1)).toBe(false)
    expect(isValid(9)).toBe(false)
    expect(isValid(0)).toBe(true)
    expect(isValid(8)).toBe(true)
  })

  test('TC-WELL-007: Goal reached triggers celebration', () => {
    const checkGoalReached = (glasses, goal) => glasses >= goal
    expect(checkGoalReached(8, 8)).toBe(true)
    expect(checkGoalReached(7, 8)).toBe(false)
  })

  test('TC-WELL-008: Water log saved with user_id and date', () => {
    saveLog(USER_ID, { log_date: '2024-01-15', water_glasses: 6 })
    const saved = logs.find(l => l.user_id === USER_ID)
    expect(saved.user_id).toBe(USER_ID)
    expect(saved.log_date).toBe('2024-01-15')
    expect(saved.water_glasses).toBe(6)
  })
})

// ─── SLEEP LOGGING ────────────────────────────────────────────────────────────

describe('WELLNESS TRACKER — Sleep Logging', () => {
  test('TC-WELL-009: Sleep hours must be 0 to 12', () => {
    const isValid = (h) => h >= 0 && h <= 12
    expect(isValid(-1)).toBe(false)
    expect(isValid(13)).toBe(false)
    expect(isValid(0)).toBe(true)
    expect(isValid(7.5)).toBe(true)
    expect(isValid(12)).toBe(true)
  })

  test('TC-WELL-010: Sleep quality must be valid value', () => {
    const valid = ['poor', 'okay', 'great']
    const isValid = (q) => valid.includes(q)
    expect(isValid('poor')).toBe(true)
    expect(isValid('okay')).toBe(true)
    expect(isValid('great')).toBe(true)
    expect(isValid('amazing')).toBe(false)
    expect(isValid('')).toBe(false)
    expect(isValid(null)).toBe(false)
  })

  test('TC-WELL-011: Decimal sleep hours accepted', () => {
    const isValid = (h) => typeof h === 'number' && h >= 0 && h <= 12
    expect(isValid(7.5)).toBe(true)
    expect(isValid(6.5)).toBe(true)
  })

  test('TC-WELL-012: Sleep log saved with quality', () => {
    const logs = []
    const saveLog = (data) => logs.push(data)
    saveLog({ user_id: USER_ID, log_date: '2024-01-15', sleep_hours: 7.5, sleep_quality: 'good' })
    expect(logs[0].sleep_hours).toBe(7.5)
    expect(logs[0].sleep_quality).toBe('good')
  })
})

// ─── UPSERT BEHAVIOR ─────────────────────────────────────────────────────────

describe('WELLNESS TRACKER — Upsert Behavior', () => {
  beforeEach(resetDb)

  test('TC-WELL-013: Saving same date updates existing record not creates new', () => {
    saveLog(USER_ID, { log_date: '2024-01-15', water_glasses: 4 })
    saveLog(USER_ID, { log_date: '2024-01-15', water_glasses: 7 })
    const dayLogs = logs.filter(l => l.user_id === USER_ID && l.log_date === '2024-01-15')
    expect(dayLogs).toHaveLength(1)
    expect(dayLogs[0].water_glasses).toBe(7)
  })

  test('TC-WELL-014: Different dates create separate records', () => {
    saveLog(USER_ID, { log_date: '2024-01-14', water_glasses: 5 })
    saveLog(USER_ID, { log_date: '2024-01-15', water_glasses: 8 })
    expect(logs.filter(l => l.user_id === USER_ID)).toHaveLength(2)
  })

  test('TC-WELL-015: Only current users logs are loaded', () => {
    saveLog(USER_ID, { log_date: '2024-01-15', water_glasses: 6 })
    saveLog(999, { log_date: '2024-01-15', water_glasses: 3 })
    const myLogs = logs.filter(l => l.user_id === USER_ID)
    expect(myLogs).toHaveLength(1)
    expect(myLogs[0].water_glasses).toBe(6)
  })
})

// ─── WEEKLY CALCULATIONS ─────────────────────────────────────────────────────

describe('WELLNESS TRACKER — Weekly Calculations', () => {
  test('TC-WELL-016: Weekly average water intake correct', () => {
    const weekLogs = [6, 8, 5, 7, 4, 8, 6]
    const avg = weekLogs.reduce((s, v) => s + v, 0) / weekLogs.length
    expect(avg).toBeCloseTo(6.28, 1)
  })

  test('TC-WELL-017: Weekly average sleep correct', () => {
    const sleepLogs = [7, 6, 8, 7.5, 6.5, 8, 7]
    const avg = sleepLogs.reduce((s, v) => s + v, 0) / sleepLogs.length
    expect(avg).toBeCloseTo(7.14, 1)
  })

  test('TC-WELL-018: Best hydration day identified correctly', () => {
    const logs = [
      { log_date: '2024-01-13', water_glasses: 5 },
      { log_date: '2024-01-14', water_glasses: 8 },
      { log_date: '2024-01-15', water_glasses: 6 }
    ]
    const best = logs.reduce((max, l) => l.water_glasses > max.water_glasses ? l : max, logs[0])
    expect(best.log_date).toBe('2024-01-14')
  })

  test('TC-WELL-019: Streak counted correctly from consecutive days', () => {
    const logDates = ['2024-01-15', '2024-01-14', '2024-01-13', '2024-01-12']
    const today = new Date('2024-01-15')
    let streak = 0
    let current = new Date(today)
    for (let i = 0; i < 30; i++) {
      const dateStr = current.toISOString().split('T')[0]
      if (logDates.includes(dateStr)) {
        streak++
        current.setDate(current.getDate() - 1)
      } else break
    }
    expect(streak).toBe(4)
  })

  test('TC-WELL-020: Streak breaks when a day is missing', () => {
    const logDates = ['2024-01-15', '2024-01-14', '2024-01-12']
    const today = new Date('2024-01-15')
    let streak = 0
    let current = new Date(today)
    for (let i = 0; i < 30; i++) {
      const dateStr = current.toISOString().split('T')[0]
      if (logDates.includes(dateStr)) {
        streak++
        current.setDate(current.getDate() - 1)
      } else break
    }
    expect(streak).toBe(2)
  })

  test('TC-WELL-021: Streak message formatted correctly', () => {
    const getMessage = (streak) => {
      if (streak === 0) return 'Start logging today!'
      if (streak === 1) return 'Logged for 1 day in a row'
      return `Logged for ${streak} days in a row` 
    }
    expect(getMessage(0)).toBe('Start logging today!')
    expect(getMessage(1)).toBe('Logged for 1 day in a row')
    expect(getMessage(7)).toBe('Logged for 7 days in a row')
  })
})
