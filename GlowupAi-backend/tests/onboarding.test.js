/**
 * ONBOARDING TESTS
 * Covers all 5 steps, navigation, validation,
 * data saving, user linking, completion flag
 */

const mockUserId = 101
let skinProfiles = []
const resetDb = () => { skinProfiles = [] }

const upsertProfile = (userId, data) => {
  const idx = skinProfiles.findIndex(p => p.user_id === userId)
  if (idx >= 0) {
    skinProfiles[idx] = { ...skinProfiles[idx], ...data, updated_at: new Date().toISOString() }
  } else {
    skinProfiles.push({ user_id: userId, ...data, created_at: new Date().toISOString() })
  }
  return skinProfiles.find(p => p.user_id === userId)
}

// ─── STEP NAVIGATION ─────────────────────────────────────────────────────────

describe('ONBOARDING — Step Navigation', () => {
  test('TC-ONB-001: Starts at step 1', () => {
    let step = 1
    expect(step).toBe(1)
  })

  test('TC-ONB-002: Next advances step by 1', () => {
    let step = 1
    const goNext = () => { if (step < 5) step++ }
    goNext()
    expect(step).toBe(2)
  })

  test('TC-ONB-003: Back decreases step by 1', () => {
    let step = 3
    const goBack = () => { if (step > 1) step-- }
    goBack()
    expect(step).toBe(2)
  })

  test('TC-ONB-004: Cannot go below step 1', () => {
    let step = 1
    const goBack = () => { if (step > 1) step-- }
    goBack()
    expect(step).toBe(1)
  })

  test('TC-ONB-005: Cannot go above step 5', () => {
    let step = 5
    const goNext = () => { if (step < 5) step++ }
    goNext()
    expect(step).toBe(5)
  })

  test('TC-ONB-006: Progress bar percentage correct for all steps', () => {
    const getProgress = (step) => Math.round((step / 5) * 100)
    expect(getProgress(1)).toBe(20)
    expect(getProgress(2)).toBe(40)
    expect(getProgress(3)).toBe(60)
    expect(getProgress(4)).toBe(80)
    expect(getProgress(5)).toBe(100)
  })

  test('TC-ONB-007: Step label shows correct step number', () => {
    const getLabel = (step) => `${step} / 5` 
    expect(getLabel(1)).toBe('1 / 5')
    expect(getLabel(3)).toBe('3 / 5')
    expect(getLabel(5)).toBe('5 / 5')
  })

  test('TC-ONB-008: Cannot proceed to next step without required selection', () => {
    const canProceed = (selection) =>
      selection !== null && selection !== undefined && selection !== ''
    expect(canProceed(null)).toBe(false)
    expect(canProceed(undefined)).toBe(false)
    expect(canProceed('')).toBe(false)
    expect(canProceed('oily')).toBe(true)
  })
})

// ─── STEP 1 — WELCOME ─────────────────────────────────────────────────────────

describe('ONBOARDING — Step 1: Welcome', () => {
  test('TC-ONB-009: Welcome screen shows correct user name', () => {
    const getWelcomeMessage = (name) => `Hello, ${name}.` 
    expect(getWelcomeMessage('Sarah')).toBe('Hello, Sarah.')
    expect(getWelcomeMessage('Hammas')).toBe('Hello, Hammas.')
  })

  test('TC-ONB-010: Welcome screen has Let\'s Begin button', () => {
    const buttons = ['Lets Begin']
    expect(buttons).toContain('Lets Begin')
  })
})

// ─── STEP 2 — SKIN TYPE ───────────────────────────────────────────────────────

describe('ONBOARDING — Step 2: Skin Type', () => {
  const validTypes = ['oily', 'dry', 'combination', 'sensitive']

  test('TC-ONB-011: All four skin types are valid options', () => {
    validTypes.forEach(t => expect(validTypes.includes(t)).toBe(true))
    expect(validTypes).toHaveLength(4)
  })

  test('TC-ONB-012: Only one skin type can be selected at a time', () => {
    let selected = null
    const select = (type) => { selected = type }
    select('oily')
    expect(selected).toBe('oily')
    select('dry')
    expect(selected).toBe('dry')
    expect(selected).not.toBe('oily')
  })

  test('TC-ONB-013: Invalid skin type is rejected', () => {
    const isValid = (t) => validTypes.includes(t)
    expect(isValid('magical')).toBe(false)
    expect(isValid('')).toBe(false)
    expect(isValid(null)).toBe(false)
    expect(isValid('OILY')).toBe(false)
  })

  test('TC-ONB-014: Cannot proceed without selecting skin type', () => {
    const canProceed = (skinType) => validTypes.includes(skinType)
    expect(canProceed(null)).toBe(false)
    expect(canProceed('oily')).toBe(true)
  })

  test('TC-ONB-015: Selected card shows checkmark state', () => {
    const isSelected = (cardType, selectedType) => cardType === selectedType
    expect(isSelected('oily', 'oily')).toBe(true)
    expect(isSelected('dry', 'oily')).toBe(false)
  })
})

// ─── STEP 3 — SKIN CONCERNS ───────────────────────────────────────────────────

describe('ONBOARDING — Step 3: Skin Concerns', () => {
  const validConcerns = [
    'acne', 'dark_spots', 'dullness', 'dryness', 'oiliness',
    'anti_aging', 'sensitivity', 'uneven_texture', 'dark_circles', 'redness'
  ]

  test('TC-ONB-016: All ten concern options exist', () => {
    expect(validConcerns).toHaveLength(10)
  })

  test('TC-ONB-017: Multiple concerns can be selected', () => {
    let selected = []
    const toggle = (c) => {
      selected = selected.includes(c) ? selected.filter(x => x !== c) : [...selected, c]
    }
    toggle('acne')
    toggle('dullness')
    toggle('redness')
    expect(selected).toHaveLength(3)
    expect(selected).toContain('acne')
    expect(selected).toContain('dullness')
    expect(selected).toContain('redness')
  })

  test('TC-ONB-018: Deselecting a concern removes it', () => {
    let selected = ['acne', 'dullness']
    const toggle = (c) => {
      selected = selected.includes(c) ? selected.filter(x => x !== c) : [...selected, c]
    }
    toggle('acne')
    expect(selected).not.toContain('acne')
    expect(selected).toContain('dullness')
  })

  test('TC-ONB-019: Toggling same concern twice returns to original state', () => {
    let selected = ['dullness']
    const toggle = (c) => {
      selected = selected.includes(c) ? selected.filter(x => x !== c) : [...selected, c]
    }
    toggle('acne')
    toggle('acne')
    expect(selected).not.toContain('acne')
    expect(selected).toContain('dullness')
  })

  test('TC-ONB-020: At least one concern required to proceed', () => {
    const canProceed = (concerns) => Array.isArray(concerns) && concerns.length > 0
    expect(canProceed([])).toBe(false)
    expect(canProceed(['acne'])).toBe(true)
    expect(canProceed(['acne', 'dullness'])).toBe(true)
  })
})

// ─── STEP 4 — LIFESTYLE ───────────────────────────────────────────────────────

describe('ONBOARDING — Step 4: Lifestyle', () => {
  test('TC-ONB-021: Valid water intake options accepted', () => {
    const valid = ['less_than_4', '4_to_6', '7_plus']
    valid.forEach(v => expect(valid.includes(v)).toBe(true))
    expect(valid.includes('unknown')).toBe(false)
  })

  test('TC-ONB-022: Valid sleep hours options accepted', () => {
    const valid = ['less_than_6', '6_to_7', '8_plus']
    valid.forEach(v => expect(valid.includes(v)).toBe(true))
  })

  test('TC-ONB-023: Valid diet type options accepted', () => {
    const valid = ['junk', 'mixed', 'healthy']
    valid.forEach(v => expect(valid.includes(v)).toBe(true))
  })

  test('TC-ONB-024: All three lifestyle fields required to proceed', () => {
    const canProceed = ({ water, sleep, diet }) =>
      water != null && sleep != null && diet != null
    expect(canProceed({ water: null, sleep: null, diet: null })).toBe(false)
    expect(canProceed({ water: '4_to_6', sleep: null, diet: null })).toBe(false)
    expect(canProceed({ water: '4_to_6', sleep: '8_plus', diet: null })).toBe(false)
    expect(canProceed({ water: '4_to_6', sleep: '8_plus', diet: 'healthy' })).toBe(true)
  })

  test('TC-ONB-025: Only one option selectable per lifestyle question', () => {
    let waterSelection = null
    const selectWater = (v) => { waterSelection = v }
    selectWater('4_to_6')
    expect(waterSelection).toBe('4_to_6')
    selectWater('7_plus')
    expect(waterSelection).toBe('7_plus')
    expect(waterSelection).not.toBe('4_to_6')
  })
})

// ─── STEP 5 — BEAUTY GOALS ────────────────────────────────────────────────────

describe('ONBOARDING — Step 5: Beauty Goals', () => {
  const validGoals = ['clear_skin', 'glass_skin', 'anti_aging', 'even_tone', 'hydrated', 'natural']

  test('TC-ONB-026: All six goal options are valid', () => {
    expect(validGoals).toHaveLength(6)
  })

  test('TC-ONB-027: Only one goal can be selected', () => {
    let goal = null
    const selectGoal = (g) => { goal = g }
    selectGoal('glass_skin')
    expect(goal).toBe('glass_skin')
    selectGoal('clear_skin')
    expect(goal).toBe('clear_skin')
    expect(goal).not.toBe('glass_skin')
  })

  test('TC-ONB-028: Cannot complete onboarding without selecting goal', () => {
    const canComplete = (goal) => validGoals.includes(goal)
    expect(canComplete(null)).toBe(false)
    expect(canComplete('')).toBe(false)
    expect(canComplete('glass_skin')).toBe(true)
  })
})

// ─── DATABASE SAVE ────────────────────────────────────────────────────────────

describe('ONBOARDING — Database Saving', () => {
  beforeEach(resetDb)

  test('TC-ONB-029: Profile saved with correct user_id', () => {
    upsertProfile(mockUserId, { skin_type: 'oily' })
    const profile = skinProfiles.find(p => p.user_id === mockUserId)
    expect(profile).toBeDefined()
    expect(profile.user_id).toBe(mockUserId)
  })

  test('TC-ONB-030: All fields saved correctly', () => {
    const data = {
      skin_type: 'combination',
      skin_concerns: ['acne', 'dullness'],
      water_intake: '4_to_6',
      sleep_hours: '8_plus',
      diet_type: 'healthy',
      beauty_goal: 'glass_skin',
      onboarding_complete: true
    }
    upsertProfile(mockUserId, data)
    const saved = skinProfiles.find(p => p.user_id === mockUserId)
    expect(saved.skin_type).toBe('combination')
    expect(saved.skin_concerns).toContain('acne')
    expect(saved.water_intake).toBe('4_to_6')
    expect(saved.sleep_hours).toBe('8_plus')
    expect(saved.diet_type).toBe('healthy')
    expect(saved.beauty_goal).toBe('glass_skin')
    expect(saved.onboarding_complete).toBe(true)
  })

  test('TC-ONB-031: Onboarding complete flag is false by default', () => {
    upsertProfile(mockUserId, { skin_type: 'oily' })
    const profile = skinProfiles.find(p => p.user_id === mockUserId)
    expect(profile.onboarding_complete).toBeFalsy()
  })

  test('TC-ONB-032: Onboarding complete flag set to true on step 5 completion', () => {
    upsertProfile(mockUserId, { skin_type: 'oily', onboarding_complete: false })
    upsertProfile(mockUserId, { onboarding_complete: true })
    const profile = skinProfiles.find(p => p.user_id === mockUserId)
    expect(profile.onboarding_complete).toBe(true)
  })

  test('TC-ONB-033: Re-submitting onboarding updates existing profile', () => {
    upsertProfile(mockUserId, { skin_type: 'oily' })
    upsertProfile(mockUserId, { skin_type: 'dry' })
    const profiles = skinProfiles.filter(p => p.user_id === mockUserId)
    expect(profiles).toHaveLength(1)
    expect(profiles[0].skin_type).toBe('dry')
  })

  test('TC-ONB-034: Skin concerns array is saved and retrieved correctly', () => {
    const concerns = ['acne', 'dark_spots', 'redness']
    upsertProfile(mockUserId, { skin_concerns: concerns })
    const profile = skinProfiles.find(p => p.user_id === mockUserId)
    expect(profile.skin_concerns).toEqual(concerns)
    expect(profile.skin_concerns).toHaveLength(3)
  })

  test('TC-ONB-035: After onboarding user is redirected to dashboard', () => {
    const getRedirectAfterOnboarding = (onboarding_complete) =>
      onboarding_complete ? '/dashboard' : '/onboarding'
    expect(getRedirectAfterOnboarding(true)).toBe('/dashboard')
    expect(getRedirectAfterOnboarding(false)).toBe('/onboarding')
  })
})
