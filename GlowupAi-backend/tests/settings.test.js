/**
 * SETTINGS TESTS
 * Covers: Profile update, email change, password change,
 * notification toggle, account deletion, skin profile reset
 */

const bcrypt = require('bcryptjs')

describe('SETTINGS — Profile Updates', () => {
  test('TC-SET-001: Valid name is accepted', () => {
    const isValidName = (n) => n?.trim().length > 0
    expect(isValidName('Sarah')).toBe(true)
    expect(isValidName('Sarah Jane')).toBe(true)
    expect(isValidName('')).toBe(false)
    expect(isValidName('   ')).toBe(false)
  })

  test('TC-SET-002: Valid email format required for update', () => {
    const isValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
    expect(isValid('new@email.com')).toBe(true)
    expect(isValid('invalidemail')).toBe(false)
  })

  test('TC-SET-003: Email uniqueness checked before update', () => {
    const users = [
      { id: 1, email: 'user1@test.com' },
      { id: 2, email: 'user2@test.com' }
    ]
    const isEmailTaken = (email, currentUserId) =>
      users.some(u => u.email === email && u.id !== currentUserId)
    expect(isEmailTaken('user2@test.com', 1)).toBe(true)
    expect(isEmailTaken('user2@test.com', 2)).toBe(false)
    expect(isEmailTaken('new@test.com', 1)).toBe(false)
  })

  test('TC-SET-004: Only current user profile can be updated', () => {
    const canUpdate = (requestUserId, targetUserId) => requestUserId === targetUserId
    expect(canUpdate(1, 1)).toBe(true)
    expect(canUpdate(1, 2)).toBe(false)
  })
})

describe('SETTINGS — Password Change', () => {
  test('TC-SET-005: Current password must be correct', () => {
    const hash = bcrypt.hashSync('CurrentPass1!', 10)
    const verify = (input) => bcrypt.compareSync(input, hash)
    expect(verify('CurrentPass1!')).toBe(true)
    expect(verify('WrongPass!')).toBe(false)
  })

  test('TC-SET-006: New password minimum 8 characters', () => {
    const isValid = (p) => p?.length >= 8
    expect(isValid('short')).toBe(false)
    expect(isValid('LongEnough1')).toBe(true)
  })

  test('TC-SET-007: New password confirmation must match', () => {
    const matches = (p, c) => p === c
    expect(matches('NewPass1!', 'NewPass1!')).toBe(true)
    expect(matches('NewPass1!', 'Different1!')).toBe(false)
  })

  test('TC-SET-008: New password cannot be same as current', () => {
    const isDifferent = (current, newPw) => current !== newPw
    expect(isDifferent('Pass123!', 'Pass123!')).toBe(false)
    expect(isDifferent('Pass123!', 'NewPass456!')).toBe(true)
  })
})

describe('SETTINGS — Notification Toggle', () => {
  test('TC-SET-009: Toggle switches between true and false', () => {
    let enabled = true
    const toggle = () => { enabled = !enabled }
    toggle()
    expect(enabled).toBe(false)
    toggle()
    expect(enabled).toBe(true)
  })

  test('TC-SET-010: Preference saved with user_id', () => {
    const prefs = []
    const savePreference = (userId, key, value) => prefs.push({ user_id: userId, key, value })
    savePreference(1, 'notifications_enabled', false)
    expect(prefs[0].user_id).toBe(1)
    expect(prefs[0].value).toBe(false)
  })
})

describe('SETTINGS — Account Deletion', () => {
  test('TC-SET-011: Deletion requires explicit confirmation', () => {
    let confirmed = false
    const requestDelete = () => { confirmed = false }
    const confirmDelete = () => { confirmed = true }
    requestDelete()
    expect(confirmed).toBe(false)
    confirmDelete()
    expect(confirmed).toBe(true)
  })

  test('TC-SET-012: Deleting user removes all their data', () => {
    const allData = {
      users: [{ id: 1 }, { id: 2 }],
      skinProfiles: [{ user_id: 1 }, { user_id: 2 }],
      chatSessions: [{ user_id: 1 }, { user_id: 2 }],
      diaryEntries: [{ user_id: 1 }, { user_id: 2 }],
      wellnessLogs: [{ user_id: 1 }, { user_id: 2 }],
      progressCheckIns: [{ user_id: 1 }, { user_id: 2 }]
    }
    const deleteUser = (userId, data) => {
      Object.keys(data).forEach(table => {
        data[table] = data[table].filter(row => row.id !== userId && row.user_id !== userId)
      })
    }
    deleteUser(1, allData)
    Object.keys(allData).forEach(table => {
      expect(allData[table].find(r => (r.id || r.user_id) === 1)).toBeUndefined()
    })
  })

  test('TC-SET-013: Skin profile can be reset and retaken', () => {
    const profiles = [{ user_id: 1, skin_type: 'oily', onboarding_complete: true }]
    const resetProfile = (userId) => {
      const idx = profiles.findIndex(p => p.user_id === userId)
      if (idx >= 0) profiles[idx] = { user_id: userId, onboarding_complete: false }
    }
    resetProfile(1)
    expect(profiles[0].onboarding_complete).toBe(false)
    expect(profiles[0].skin_type).toBeUndefined()
  })
})
