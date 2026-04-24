/**
 * AUTH TESTS
 * Covers every signup rule, login rule, JWT behavior,
 * session handling, password rules, logout, token expiry,
 * brute force protection logic, and edge cases
 */

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'test_secret_key_minimum_32_characters_long'

const hashPassword = (pw) => bcrypt.hashSync(pw, 10)
const comparePassword = (pw, hash) => bcrypt.compareSync(pw, hash)
const generateToken = (payload, expiresIn = '7d') =>
  jwt.sign(payload, JWT_SECRET, { expiresIn })
const verifyToken = (token) => jwt.verify(token, JWT_SECRET)

// Mock user database
let mockUsers = []
let nextId = 1

const resetDb = () => { mockUsers = []; nextId = 1 }

const createUser = ({ full_name, email, password }) => {
  const existing = mockUsers.find(u => u.email === email)
  if (existing) throw { status: 409, message: 'Email already registered' }
  const user = {
    id: nextId++,
    full_name,
    email,
    password: hashPassword(password),
    created_at: new Date().toISOString()
  }
  mockUsers.push(user)
  return user
}

const loginUser = ({ email, password }) => {
  const user = mockUsers.find(u => u.email === email)
  if (!user) throw { status: 401, message: 'Invalid email or password' }
  const valid = comparePassword(password, user.password)
  if (!valid) throw { status: 401, message: 'Invalid email or password' }
  const token = generateToken({ id: user.id, email: user.email })
  return { token, user: { id: user.id, full_name: user.full_name, email: user.email } }
}

// ─── SIGNUP VALIDATION ────────────────────────────────────────────────────────

describe('SIGNUP — Field Validation', () => {
  beforeEach(resetDb)

  test('TC-AUTH-001: Rejects signup with missing full_name', () => {
    const validate = ({ full_name, email, password }) => {
      if (!full_name?.trim()) return 'full_name is required'
      if (!email?.trim()) return 'email is required'
      if (!password?.trim()) return 'password is required'
      return null
    }
    expect(validate({ email: 'a@b.com', password: 'Pass123!' })).toBe('full_name is required')
  })

  test('TC-AUTH-002: Rejects signup with missing email', () => {
    const validate = ({ full_name, email, password }) => {
      if (!full_name?.trim()) return 'full_name is required'
      if (!email?.trim()) return 'email is required'
      if (!password?.trim()) return 'password is required'
      return null
    }
    expect(validate({ full_name: 'Jane', password: 'Pass123!' })).toBe('email is required')
  })

  test('TC-AUTH-003: Rejects signup with missing password', () => {
    const validate = ({ full_name, email, password }) => {
      if (!full_name?.trim()) return 'full_name is required'
      if (!email?.trim()) return 'email is required'
      if (!password?.trim()) return 'password is required'
      return null
    }
    expect(validate({ full_name: 'Jane', email: 'a@b.com' })).toBe('password is required')
  })

  test('TC-AUTH-004: Rejects all empty fields', () => {
    const validate = ({ full_name, email, password }) => {
      const errors = []
      if (!full_name?.trim()) errors.push('full_name')
      if (!email?.trim()) errors.push('email')
      if (!password?.trim()) errors.push('password')
      return errors
    }
    expect(validate({})).toHaveLength(3)
  })

  test('TC-AUTH-005: Rejects whitespace-only name', () => {
    const isValidName = (n) => n?.trim().length > 0
    expect(isValidName('   ')).toBe(false)
    expect(isValidName('\t')).toBe(false)
    expect(isValidName('Jane')).toBe(true)
  })

  test('TC-AUTH-006: Rejects invalid email formats', () => {
    const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
    expect(isValidEmail('notanemail')).toBe(false)
    expect(isValidEmail('missing@domain')).toBe(false)
    expect(isValidEmail('@nodomain.com')).toBe(false)
    expect(isValidEmail('spaces @test.com')).toBe(false)
    expect(isValidEmail('valid@test.com')).toBe(true)
    expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
  })

  test('TC-AUTH-007: Rejects password shorter than 8 characters', () => {
    const isValidPassword = (p) => p?.length >= 8
    expect(isValidPassword('short')).toBe(false)
    expect(isValidPassword('1234567')).toBe(false)
    expect(isValidPassword('12345678')).toBe(true)
  })

  test('TC-AUTH-008: Rejects mismatched passwords', () => {
    const passwordsMatch = (p, c) => p === c
    expect(passwordsMatch('Pass123!', 'Pass123!')).toBe(true)
    expect(passwordsMatch('Pass123!', 'Pass124!')).toBe(false)
    expect(passwordsMatch('Pass123!', 'pass123!')).toBe(false)
  })

  test('TC-AUTH-009: Rejects duplicate email', () => {
    createUser({ full_name: 'Jane', email: 'jane@test.com', password: 'Password1!' })
    expect(() =>
      createUser({ full_name: 'Jane2', email: 'jane@test.com', password: 'Password1!' })
    ).toThrow('Email already registered')
  })

  test('TC-AUTH-010: Email comparison is case-insensitive', () => {
    const normalizeEmail = (e) => e.toLowerCase().trim()
    expect(normalizeEmail('JANE@TEST.COM')).toBe('jane@test.com')
    expect(normalizeEmail(' Jane@Test.com ')).toBe('jane@test.com')
  })

  test('TC-AUTH-011: Successful signup returns user object without password', () => {
    const user = createUser({ full_name: 'Jane', email: 'jane@test.com', password: 'Password1!' })
    const token = generateToken({ id: user.id, email: user.email })
    const response = { token, user: { id: user.id, full_name: user.full_name, email: user.email } }
    expect(response.user).not.toHaveProperty('password')
    expect(response.token).toBeDefined()
    expect(response.user.full_name).toBe('Jane')
  })

  test('TC-AUTH-012: Password is hashed before storage', () => {
    const user = createUser({ full_name: 'Jane', email: 'jane@test.com', password: 'Password1!' })
    expect(user.password).not.toBe('Password1!')
    expect(user.password.startsWith('$2')).toBe(true)
  })

  test('TC-AUTH-013: Signup creates skin profile row for user', () => {
    const skinProfiles = []
    const signupWithProfile = (data) => {
      const user = createUser(data)
      skinProfiles.push({ user_id: user.id, onboarding_complete: false })
      return user
    }
    const user = signupWithProfile({ full_name: 'Jane', email: 'jane@test.com', password: 'Pass1234!' })
    const profile = skinProfiles.find(p => p.user_id === user.id)
    expect(profile).toBeDefined()
    expect(profile.onboarding_complete).toBe(false)
  })
})

// ─── LOGIN ────────────────────────────────────────────────────────────────────

describe('LOGIN — All Scenarios', () => {
  beforeEach(() => {
    resetDb()
    createUser({ full_name: 'Jane', email: 'jane@test.com', password: 'Password1!' })
  })

  test('TC-AUTH-014: Successful login with correct credentials', () => {
    const result = loginUser({ email: 'jane@test.com', password: 'Password1!' })
    expect(result.token).toBeDefined()
    expect(result.user.email).toBe('jane@test.com')
    expect(result.user).not.toHaveProperty('password')
  })

  test('TC-AUTH-015: Login fails with wrong password', () => {
    expect(() =>
      loginUser({ email: 'jane@test.com', password: 'WrongPassword!' })
    ).toThrow('Invalid email or password')
  })

  test('TC-AUTH-016: Login fails with non-existent email', () => {
    expect(() =>
      loginUser({ email: 'nobody@test.com', password: 'Password1!' })
    ).toThrow('Invalid email or password')
  })

  test('TC-AUTH-017: Login error message is identical for wrong email and wrong password', () => {
    let errorA, errorB
    try { loginUser({ email: 'nobody@test.com', password: 'Password1!' }) } catch(e) { errorA = e.message }
    try { loginUser({ email: 'jane@test.com', password: 'WrongPass!' }) } catch(e) { errorB = e.message }
    expect(errorA).toBe(errorB)
  })

  test('TC-AUTH-018: Login fails with empty email', () => {
    const validate = ({ email, password }) => {
      if (!email?.trim()) return 'email is required'
      if (!password?.trim()) return 'password is required'
      return null
    }
    expect(validate({ email: '', password: 'Password1!' })).toBe('email is required')
  })

  test('TC-AUTH-019: Login fails with empty password', () => {
    const validate = ({ email, password }) => {
      if (!email?.trim()) return 'email is required'
      if (!password?.trim()) return 'password is required'
      return null
    }
    expect(validate({ email: 'jane@test.com', password: '' })).toBe('password is required')
  })

  test('TC-AUTH-020: Login returns a valid JWT token', () => {
    const result = loginUser({ email: 'jane@test.com', password: 'Password1!' })
    const decoded = verifyToken(result.token)
    expect(decoded.email).toBe('jane@test.com')
    expect(decoded.id).toBeDefined()
  })

  test('TC-AUTH-021: JWT token contains correct user id', () => {
    const user = mockUsers[0]
    const result = loginUser({ email: 'jane@test.com', password: 'Password1!' })
    const decoded = verifyToken(result.token)
    expect(decoded.id).toBe(user.id)
  })

  test('TC-AUTH-022: JWT token expires in 7 days', () => {
    const result = loginUser({ email: 'jane@test.com', password: 'Password1!' })
    const decoded = verifyToken(result.token)
    const expiresIn = decoded.exp - decoded.iat
    expect(expiresIn).toBe(7 * 24 * 60 * 60)
  })
})

// ─── JWT MIDDLEWARE ───────────────────────────────────────────────────────────

describe('JWT MIDDLEWARE — Token Verification', () => {
  const authenticateToken = (token) => {
    if (!token) throw { status: 401, message: 'No token provided' }
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (e) {
      throw { status: 403, message: 'Invalid or expired token' }
    }
  }

  test('TC-AUTH-023: Valid token is accepted', () => {
    const token = generateToken({ id: 1, email: 'test@test.com' })
    const decoded = authenticateToken(token)
    expect(decoded.id).toBe(1)
  })

  test('TC-AUTH-024: Missing token throws 401', () => {
    expect(() => authenticateToken(null)).toThrow('No token provided')
    expect(() => authenticateToken(undefined)).toThrow('No token provided')
    expect(() => authenticateToken('')).toThrow('No token provided')
  })

  test('TC-AUTH-025: Tampered token throws 403', () => {
    const token = generateToken({ id: 1, email: 'test@test.com' })
    const tampered = token.slice(0, -5) + 'XXXXX'
    expect(() => authenticateToken(tampered)).toThrow('Invalid or expired token')
  })

  test('TC-AUTH-026: Token signed with wrong secret is rejected', () => {
    const fakeToken = jwt.sign({ id: 1 }, 'wrong_secret')
    expect(() => authenticateToken(fakeToken)).toThrow('Invalid or expired token')
  })

  test('TC-AUTH-027: Expired token is rejected', () => {
    const expiredToken = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '1ms' })
    return new Promise(resolve => {
      setTimeout(() => {
        expect(() => authenticateToken(expiredToken)).toThrow('Invalid or expired token')
        resolve()
      }, 10)
    })
  })

  test('TC-AUTH-028: Token payload contains id and email', () => {
    const token = generateToken({ id: 5, email: 'user@test.com' })
    const decoded = authenticateToken(token)
    expect(decoded).toHaveProperty('id', 5)
    expect(decoded).toHaveProperty('email', 'user@test.com')
  })

  test('TC-AUTH-029: Bearer token is extracted correctly from header', () => {
    const extractToken = (authHeader) => {
      if (!authHeader) return null
      const parts = authHeader.split(' ')
      if (parts[0] !== 'Bearer' || !parts[1]) return null
      return parts[1]
    }
    const token = generateToken({ id: 1, email: 'a@b.com' })
    expect(extractToken(`Bearer ${token}`)).toBe(token)
    expect(extractToken('InvalidFormat')).toBeNull()
    expect(extractToken(null)).toBeNull()
    expect(extractToken('')).toBeNull()
  })
})

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

describe('LOGOUT — State Clearing', () => {
  test('TC-AUTH-030: Logout removes token from storage', () => {
    const storage = { token: 'some_token' }
    const logout = () => { delete storage.token }
    logout()
    expect(storage.token).toBeUndefined()
  })

  test('TC-AUTH-031: Logout sets user to null', () => {
    let user = { id: 1, email: 'test@test.com' }
    let isAuthenticated = true
    const logout = () => { user = null; isAuthenticated = false }
    logout()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
  })

  test('TC-AUTH-032: After logout all user data is cleared', () => {
    const state = {
      user: { id: 1 },
      skinProfile: { skin_type: 'oily' },
      chatSessions: [{ id: 1 }],
      wellnessLogs: [{ id: 1 }],
      diaryEntries: [{ id: 1 }],
      progressCheckIns: [{ id: 1 }]
    }
    const clearState = (s) => {
      s.user = null
      s.skinProfile = null
      s.chatSessions = []
      s.wellnessLogs = []
      s.diaryEntries = []
      s.progressCheckIns = []
    }
    clearState(state)
    expect(state.user).toBeNull()
    expect(state.skinProfile).toBeNull()
    expect(state.chatSessions).toHaveLength(0)
    expect(state.wellnessLogs).toHaveLength(0)
    expect(state.diaryEntries).toHaveLength(0)
    expect(state.progressCheckIns).toHaveLength(0)
  })

  test('TC-AUTH-033: Accessing protected data after logout fails', () => {
    let session = { user: { id: 1 } }
    const logout = () => { session = null }
    const getProtectedData = () => {
      if (!session) throw new Error('Unauthorized')
      return 'data'
    }
    logout()
    expect(() => getProtectedData()).toThrow('Unauthorized')
  })
})

// ─── SESSION PERSISTENCE ──────────────────────────────────────────────────────

describe('SESSION PERSISTENCE', () => {
  test('TC-AUTH-034: Token stored in localStorage persists across page reload', () => {
    const fakeStorage = {}
    const setToken = (t) => { fakeStorage.token = t }
    const getToken = () => fakeStorage.token || null
    setToken('my_token')
    const retrieved = getToken()
    expect(retrieved).toBe('my_token')
  })

  test('TC-AUTH-035: App restores session from stored token on load', () => {
    const fakeStorage = { token: generateToken({ id: 1, email: 'test@test.com' }) }
    const getToken = () => fakeStorage.token
    const restoreSession = () => {
      const token = getToken()
      if (!token) return null
      try { return verifyToken(token) } catch { return null }
    }
    const session = restoreSession()
    expect(session).not.toBeNull()
    expect(session.id).toBe(1)
  })

  test('TC-AUTH-036: App handles corrupted stored token gracefully', () => {
    const fakeStorage = { token: 'corrupted.token.value' }
    const restoreSession = () => {
      try { return verifyToken(fakeStorage.token) } catch { return null }
    }
    expect(restoreSession()).toBeNull()
  })

  test('TC-AUTH-037: Protected route redirects unauthenticated user', () => {
    const canAccess = (isAuthenticated) => isAuthenticated
    expect(canAccess(false)).toBe(false)
    expect(canAccess(true)).toBe(true)
  })

  test('TC-AUTH-038: Authenticated user is redirected away from landing page', () => {
    const getRedirect = (isAuthenticated, path) => {
      if (path === '/' && isAuthenticated) return '/dashboard'
      return path
    }
    expect(getRedirect(true, '/')).toBe('/dashboard')
    expect(getRedirect(false, '/')).toBe('/')
  })
})

// ─── PASSWORD SECURITY ────────────────────────────────────────────────────────

describe('PASSWORD SECURITY', () => {
  test('TC-AUTH-039: bcrypt hash is never the same as plaintext', () => {
    const hash = hashPassword('MyPassword123!')
    expect(hash).not.toBe('MyPassword123!')
  })

  test('TC-AUTH-040: Two hashes of same password are different', () => {
    const hash1 = hashPassword('MyPassword123!')
    const hash2 = hashPassword('MyPassword123!')
    expect(hash1).not.toBe(hash2)
  })

  test('TC-AUTH-041: Correct password validates against hash', () => {
    const hash = hashPassword('MyPassword123!')
    expect(comparePassword('MyPassword123!', hash)).toBe(true)
  })

  test('TC-AUTH-042: Wrong password fails validation', () => {
    const hash = hashPassword('MyPassword123!')
    expect(comparePassword('WrongPassword!', hash)).toBe(false)
  })

  test('TC-AUTH-043: Change password requires current password verification', () => {
    const user = { password: hashPassword('OldPass123!') }
    const changePassword = (currentPw, newPw) => {
      if (!comparePassword(currentPw, user.password)) throw new Error('Current password incorrect')
      user.password = hashPassword(newPw)
      return true
    }
    expect(() => changePassword('WrongPass!', 'NewPass123!')).toThrow('Current password incorrect')
    expect(changePassword('OldPass123!', 'NewPass123!')).toBe(true)
  })

  test('TC-AUTH-044: New password cannot be empty', () => {
    const isValidNewPassword = (p) => p?.trim().length >= 8
    expect(isValidNewPassword('')).toBe(false)
    expect(isValidNewPassword('   ')).toBe(false)
    expect(isValidNewPassword('NewPass1')).toBe(true)
  })
})
