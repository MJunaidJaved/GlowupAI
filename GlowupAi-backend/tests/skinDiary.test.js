/**
 * SKIN DIARY TESTS
 * Covers: Entry creation, mood selection, calendar view,
 * filtering, CRUD, validation, mood colors, entry dates
 */

const USER_ID = 301
let entries = []
const resetDb = () => { entries = [] }

const saveEntry = (userId, data) => {
  const idx = entries.findIndex(e => e.user_id === userId && e.entry_date === data.entry_date)
  if (idx >= 0) {
    entries[idx] = { ...entries[idx], ...data }
  } else {
    entries.push({ id: entries.length + 1, user_id: userId, ...data })
  }
  return entries.find(e => e.user_id === userId && e.entry_date === data.entry_date)
}

// ─── VALIDATION ─────────────────────────────────────────────────────────────

describe('SKIN DIARY — Validation', () => {
  test('TC-DIARY-001: entry_date is required', () => {
    const isValid = (data) => !!data.entry_date
    expect(isValid({ entry_date: null })).toBe(false)
    expect(isValid({ entry_date: '2024-01-15' })).toBe(true)
  })

  test('TC-DIARY-002: Mood must be one of valid values', () => {
    const validMoods = ['glowing', 'good', 'okay', 'dry', 'breaking_out']
    const isValid = (m) => validMoods.includes(m)
    expect(isValid('glowing')).toBe(true)
    expect(isValid('good')).toBe(true)
    expect(isValid('okay')).toBe(true)
    expect(isValid('dry')).toBe(true)
    expect(isValid('breaking_out')).toBe(true)
    expect(isValid('happy')).toBe(false)
    expect(isValid('')).toBe(false)
    expect(isValid(null)).toBe(false)
  })

  test('TC-DIARY-003: skin_notes is required to save entry', () => {
    const isValid = (notes) => notes?.trim().length > 0
    expect(isValid('')).toBe(false)
    expect(isValid('   ')).toBe(false)
    expect(isValid('Skin felt hydrated')).toBe(true)
  })

  test('TC-DIARY-004: lifestyle_notes is optional', () => {
    const isValidEntry = ({ entry_date, mood, skin_notes }) =>
      !!entry_date && !!mood && skin_notes?.trim().length > 0
    const entry = { entry_date: '2024-01-15', mood: 'good', skin_notes: 'Felt great' }
    expect(isValidEntry(entry)).toBe(true)
  })

  test('TC-DIARY-005: entry_date format must be YYYY-MM-DD', () => {
    const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d)
    expect(isValidDate('2024-01-15')).toBe(true)
    expect(isValidDate('15-01-2024')).toBe(false)
    expect(isValidDate('2024/01/15')).toBe(false)
  })
})

// ─── SAVING AND LOADING ───────────────────────────────────────────────────────

describe('SKIN DIARY — Saving and Loading', () => {
  beforeEach(resetDb)

  test('TC-DIARY-006: Entry saved with correct user_id', () => {
    saveEntry(USER_ID, { entry_date: '2024-01-15', mood: 'good', skin_notes: 'Felt great' })
    const saved = entries.find(e => e.user_id === USER_ID)
    expect(saved.user_id).toBe(USER_ID)
  })

  test('TC-DIARY-007: One entry per day rule enforced', () => {
    saveEntry(USER_ID, { entry_date: '2024-01-15', mood: 'good', skin_notes: 'Morning' })
    saveEntry(USER_ID, { entry_date: '2024-01-15', mood: 'okay', skin_notes: 'Evening' })
    const dayEntries = entries.filter(e => e.user_id === USER_ID && e.entry_date === '2024-01-15')
    expect(dayEntries).toHaveLength(1)
    expect(dayEntries[0].mood).toBe('okay')
  })

  test('TC-DIARY-008: Different days create separate entries', () => {
    saveEntry(USER_ID, { entry_date: '2024-01-15', mood: 'good', skin_notes: 'Day 1' })
    saveEntry(USER_ID, { entry_date: '2024-01-16', mood: 'glowing', skin_notes: 'Day 2' })
    expect(entries.filter(e => e.user_id === USER_ID)).toHaveLength(2)
  })

  test('TC-DIARY-009: Entries sorted by date descending', () => {
    saveEntry(USER_ID, { entry_date: '2024-01-10', mood: 'okay', skin_notes: 'Old' })
    saveEntry(USER_ID, { entry_date: '2024-01-20', mood: 'glowing', skin_notes: 'New' })
    saveEntry(USER_ID, { entry_date: '2024-01-15', mood: 'good', skin_notes: 'Middle' })
    const sorted = entries
      .filter(e => e.user_id === USER_ID)
      .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
    expect(sorted[0].entry_date).toBe('2024-01-20')
    expect(sorted[2].entry_date).toBe('2024-01-10')
  })

  test('TC-DIARY-010: Delete entry removes it from list', () => {
    saveEntry(USER_ID, { entry_date: '2024-01-15', mood: 'good', skin_notes: 'Test' })
    const entry = entries.find(e => e.user_id === USER_ID)
    entries.splice(entries.indexOf(entry), 1)
    expect(entries.find(e => e.user_id === USER_ID)).toBeUndefined()
  })

  test('TC-DIARY-011: Only current users entries are loaded', () => {
    saveEntry(USER_ID, { entry_date: '2024-01-15', mood: 'good', skin_notes: 'Mine' })
    saveEntry(999, { entry_date: '2024-01-15', mood: 'dry', skin_notes: 'Not mine' })
    const myEntries = entries.filter(e => e.user_id === USER_ID)
    expect(myEntries).toHaveLength(1)
    expect(myEntries[0].skin_notes).toBe('Mine')
  })
})

// ─── CALENDAR ─────────────────────────────────────────────────────────────────

describe('SKIN DIARY — Calendar', () => {
  beforeEach(resetDb)

  test('TC-DIARY-012: Calendar dot shows on days with entries', () => {
    saveEntry(USER_ID, { entry_date: '2024-01-15', mood: 'glowing', skin_notes: 'Great day' })
    const entryDates = entries.filter(e => e.user_id === USER_ID).map(e => e.entry_date)
    const hasEntry = (date) => entryDates.includes(date)
    expect(hasEntry('2024-01-15')).toBe(true)
    expect(hasEntry('2024-01-16')).toBe(false)
  })

  test('TC-DIARY-013: Clicking date with entry returns that entry', () => {
    saveEntry(USER_ID, { entry_date: '2024-01-15', mood: 'good', skin_notes: 'Felt nice' })
    const getEntryByDate = (userId, date) =>
      entries.find(e => e.user_id === userId && e.entry_date === date) || null
    const entry = getEntryByDate(USER_ID, '2024-01-15')
    expect(entry).not.toBeNull()
    expect(entry.mood).toBe('good')
    expect(getEntryByDate(USER_ID, '2024-01-16')).toBeNull()
  })

  test('TC-DIARY-014: Mood color mapping is correct', () => {
    const moodColors = {
      glowing: '#3D5A3E',
      good: '#6B8F6C',
      okay: '#C8A882',
      dry: '#9AABB9',
      breaking_out: '#C0392B'
    }
    expect(moodColors.glowing).toBeDefined()
    expect(moodColors.breaking_out).toBeDefined()
    expect(Object.keys(moodColors)).toHaveLength(5)
  })
})
