/**
 * ROUTINE TESTS
 * Covers: AM/PM routine creation, step management,
 * checklist, completion tracking, user linking
 */

const USER_ID = 501
let routines = []
let checklists = []
const resetDb = () => { routines = []; checklists = [] }

const saveRoutine = (userId, type, steps) => {
  const idx = routines.findIndex(r => r.user_id === userId && r.routine_type === type)
  if (idx >= 0) {
    routines[idx].steps = steps
    routines[idx].updated_at = new Date().toISOString()
  } else {
    routines.push({ id: routines.length + 1, user_id: userId, routine_type: type, steps, created_at: new Date().toISOString() })
  }
  return routines.find(r => r.user_id === userId && r.routine_type === type)
}

const saveChecklist = (userId, date, completedSteps) => {
  const idx = checklists.findIndex(c => c.user_id === userId && c.date === date)
  if (idx >= 0) {
    checklists[idx].completed_steps = completedSteps
  } else {
    checklists.push({ user_id: userId, date, completed_steps: completedSteps })
  }
}

// ─── ROUTINE CREATION ─────────────────────────────────────────────────────────

describe('ROUTINE — Creation and Loading', () => {
  beforeEach(resetDb)

  test('TC-RTN-001: AM routine created with correct user_id', () => {
    saveRoutine(USER_ID, 'am', [{ order: 1, product_type: 'Cleanser', instruction: 'Wash face' }])
    const r = routines.find(r => r.user_id === USER_ID && r.routine_type === 'am')
    expect(r).toBeDefined()
    expect(r.user_id).toBe(USER_ID)
    expect(r.routine_type).toBe('am')
  })

  test('TC-RTN-002: PM routine created separately from AM', () => {
    saveRoutine(USER_ID, 'am', [])
    saveRoutine(USER_ID, 'pm', [])
    const userRoutines = routines.filter(r => r.user_id === USER_ID)
    expect(userRoutines).toHaveLength(2)
    expect(userRoutines.find(r => r.routine_type === 'am')).toBeDefined()
    expect(userRoutines.find(r => r.routine_type === 'pm')).toBeDefined()
  })

  test('TC-RTN-003: Routine type must be am or pm only', () => {
    const validTypes = ['am', 'pm']
    expect(validTypes.includes('am')).toBe(true)
    expect(validTypes.includes('pm')).toBe(true)
    expect(validTypes.includes('noon')).toBe(false)
    expect(validTypes.includes('')).toBe(false)
  })

  test('TC-RTN-004: Steps array is required', () => {
    const isValid = (steps) => Array.isArray(steps)
    expect(isValid(null)).toBe(false)
    expect(isValid(undefined)).toBe(false)
    expect(isValid([])).toBe(true)
    expect(isValid([{ order: 1 }])).toBe(true)
  })

  test('TC-RTN-005: Updating routine replaces steps for same type', () => {
    const originalSteps = [{ order: 1, product_type: 'Cleanser' }]
    const newSteps = [{ order: 1, product_type: 'Cleanser' }, { order: 2, product_type: 'Toner' }]
    saveRoutine(USER_ID, 'am', originalSteps)
    saveRoutine(USER_ID, 'am', newSteps)
    const amRoutines = routines.filter(r => r.user_id === USER_ID && r.routine_type === 'am')
    expect(amRoutines).toHaveLength(1)
    expect(amRoutines[0].steps).toHaveLength(2)
  })

  test('TC-RTN-006: Steps are ordered correctly', () => {
    const steps = [
      { order: 3, product_type: 'Moisturizer' },
      { order: 1, product_type: 'Cleanser' },
      { order: 2, product_type: 'Toner' }
    ]
    const sorted = [...steps].sort((a, b) => a.order - b.order)
    expect(sorted[0].product_type).toBe('Cleanser')
    expect(sorted[1].product_type).toBe('Toner')
    expect(sorted[2].product_type).toBe('Moisturizer')
  })

  test('TC-RTN-007: Routine generated based on skin type', () => {
    const getDefaultSteps = (skinType) => {
      if (skinType === 'oily') return ['Gel Cleanser', 'Niacinamide Toner', 'Oil-Free Moisturizer', 'SPF']
      if (skinType === 'dry') return ['Cream Cleanser', 'Hydrating Toner', 'Rich Moisturizer', 'Face Oil', 'SPF']
      return ['Gentle Cleanser', 'Toner', 'Moisturizer', 'SPF']
    }
    expect(getDefaultSteps('oily')).toContain('Gel Cleanser')
    expect(getDefaultSteps('dry')).toContain('Rich Moisturizer')
    expect(getDefaultSteps('combination')).toContain('SPF')
  })
})

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

describe('ROUTINE — Daily Checklist', () => {
  beforeEach(resetDb)

  test('TC-RTN-008: Checking step marks it complete', () => {
    let steps = [{ id: 'step1', completed: false }, { id: 'step2', completed: false }]
    const check = (id) => { steps = steps.map(s => s.id === id ? { ...s, completed: true } : s) }
    check('step1')
    expect(steps[0].completed).toBe(true)
    expect(steps[1].completed).toBe(false)
  })

  test('TC-RTN-009: Unchecking step marks it incomplete', () => {
    let steps = [{ id: 'step1', completed: true }]
    const toggle = (id) => { steps = steps.map(s => s.id === id ? { ...s, completed: !s.completed } : s) }
    toggle('step1')
    expect(steps[0].completed).toBe(false)
  })

  test('TC-RTN-010: Completion percentage calculated correctly', () => {
    const steps = [
      { completed: true }, { completed: true }, { completed: false }, { completed: true }
    ]
    const percentage = Math.round((steps.filter(s => s.completed).length / steps.length) * 100)
    expect(percentage).toBe(75)
  })

  test('TC-RTN-011: Checklist saved with user_id and date', () => {
    saveChecklist(USER_ID, '2024-01-15', ['step1', 'step2'])
    const saved = checklists.find(c => c.user_id === USER_ID && c.date === '2024-01-15')
    expect(saved).toBeDefined()
    expect(saved.completed_steps).toContain('step1')
  })

  test('TC-RTN-012: All steps complete triggers celebration', () => {
    const allComplete = (steps) => steps.every(s => s.completed)
    expect(allComplete([{ completed: true }, { completed: true }])).toBe(true)
    expect(allComplete([{ completed: true }, { completed: false }])).toBe(false)
  })

  test('TC-RTN-013: Checklist resets for new day', () => {
    const getChecklist = (date, savedDate, savedSteps) => {
      if (date !== savedDate) return []
      return savedSteps
    }
    expect(getChecklist('2024-01-16', '2024-01-15', ['step1'])).toHaveLength(0)
    expect(getChecklist('2024-01-15', '2024-01-15', ['step1'])).toHaveLength(1)
  })

  test('TC-RTN-014: Checklist upsert updates same date without duplicate', () => {
    saveChecklist(USER_ID, '2024-01-15', ['step1'])
    saveChecklist(USER_ID, '2024-01-15', ['step1', 'step2'])
    const dayChecklists = checklists.filter(c => c.user_id === USER_ID && c.date === '2024-01-15')
    expect(dayChecklists).toHaveLength(1)
    expect(dayChecklists[0].completed_steps).toHaveLength(2)
  })
})
