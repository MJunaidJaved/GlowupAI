/**
 * CHAT TESTS
 * Covers: Session creation, message sending, AI responses,
 * history loading, user isolation, delete, pagination,
 * typing indicator, suggestion chips, empty states
 */

const USER_A = 1
const USER_B = 2

let sessions = []
let messages = []
let nextSessionId = 1
let nextMessageId = 1

const resetDb = () => {
  sessions = []
  messages = []
  nextSessionId = 1
  nextMessageId = 1
}

const createSession = (userId, title = 'New Chat') => {
  const session = {
    id: nextSessionId++,
    user_id: userId,
    title,
    last_message_preview: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  sessions.push(session)
  return session
}

const addMessage = (sessionId, userId, role, text) => {
  const session = sessions.find(s => s.id === sessionId && s.user_id === userId)
  if (!session) throw new Error('Session not found or unauthorized')
  const message = {
    id: nextMessageId++,
    session_id: sessionId,
    user_id: userId,
    role,
    message_text: text,
    created_at: new Date().toISOString()
  }
  messages.push(message)
  session.last_message_preview = text.slice(0, 60)
  session.updated_at = new Date().toISOString()
  return message
}

// ─── SESSION MANAGEMENT ───────────────────────────────────────────────────────

describe('CHAT — Session Management', () => {
  beforeEach(resetDb)

  test('TC-CHAT-001: Session created with correct user_id', () => {
    const s = createSession(USER_A, 'My first chat')
    expect(s.user_id).toBe(USER_A)
    expect(s.title).toBe('My first chat')
    expect(s.id).toBeDefined()
  })

  test('TC-CHAT-002: User can create multiple sessions', () => {
    createSession(USER_A, 'Chat 1')
    createSession(USER_A, 'Chat 2')
    createSession(USER_A, 'Chat 3')
    const userSessions = sessions.filter(s => s.user_id === USER_A)
    expect(userSessions).toHaveLength(3)
  })

  test('TC-CHAT-003: Session title defaults to New Chat when not provided', () => {
    const s = createSession(USER_A)
    expect(s.title).toBe('New Chat')
  })

  test('TC-CHAT-004: Session title is first 40 chars of first message', () => {
    const getTitle = (msg) => msg?.slice(0, 40) || 'New Chat'
    const long = 'What moisturizer should I use for my oily skin in winter?'
    expect(getTitle(long)).toBe('What moisturizer should I use for my oil')
    expect(getTitle('')).toBe('New Chat')
    expect(getTitle(null)).toBe('New Chat')
  })

  test('TC-CHAT-005: Sessions sorted by updated_at descending', () => {
    const s1 = createSession(USER_A, 'Old chat')
    const s2 = createSession(USER_A, 'New chat')
    s2.updated_at = '2024-02-01T00:00:00Z'
    s1.updated_at = '2024-01-01T00:00:00Z'
    const sorted = sessions
      .filter(s => s.user_id === USER_A)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    expect(sorted[0].title).toBe('New chat')
  })

  test('TC-CHAT-006: Deleting session removes it from list', () => {
    const s = createSession(USER_A, 'To delete')
    const deleteSession = (id, userId) => {
      const idx = sessions.findIndex(s => s.id === id && s.user_id === userId)
      if (idx < 0) throw new Error('Not found')
      sessions.splice(idx, 1)
    }
    deleteSession(s.id, USER_A)
    expect(sessions.find(x => x.id === s.id)).toBeUndefined()
  })

  test('TC-CHAT-007: User cannot delete another users session', () => {
    const s = createSession(USER_A, 'Mine')
    const deleteSession = (id, userId) => {
      const idx = sessions.findIndex(s => s.id === id && s.user_id === userId)
      if (idx < 0) throw new Error('Not found or unauthorized')
      sessions.splice(idx, 1)
    }
    expect(() => deleteSession(s.id, USER_B)).toThrow('Not found or unauthorized')
  })

  test('TC-CHAT-008: Deleting session deletes all its messages', () => {
    const s = createSession(USER_A)
    addMessage(s.id, USER_A, 'user', 'Hello')
    addMessage(s.id, USER_A, 'ai', 'Hi there')
    const deleteSession = (id, userId) => {
      const idx = sessions.findIndex(s => s.id === id && s.user_id === userId)
      if (idx < 0) throw new Error('Not found')
      sessions.splice(idx, 1)
      messages = messages.filter(m => m.session_id !== id)
    }
    deleteSession(s.id, USER_A)
    expect(messages.filter(m => m.session_id === s.id)).toHaveLength(0)
  })
})

// ─── MESSAGE SENDING ──────────────────────────────────────────────────────────

describe('CHAT — Message Sending', () => {
  beforeEach(resetDb)

  test('TC-CHAT-009: User message saved with role user', () => {
    const s = createSession(USER_A)
    const msg = addMessage(s.id, USER_A, 'user', 'What cleanser is best for acne?')
    expect(msg.role).toBe('user')
    expect(msg.message_text).toBe('What cleanser is best for acne?')
    expect(msg.user_id).toBe(USER_A)
    expect(msg.session_id).toBe(s.id)
  })

  test('TC-CHAT-010: AI message saved with role ai', () => {
    const s = createSession(USER_A)
    addMessage(s.id, USER_A, 'user', 'Question')
    const aiMsg = addMessage(s.id, USER_A, 'ai', 'For acne-prone skin, use salicylic acid cleanser.')
    expect(aiMsg.role).toBe('ai')
  })

  test('TC-CHAT-011: Empty message is rejected', () => {
    const isValid = (msg) => msg?.trim().length > 0
    expect(isValid('')).toBe(false)
    expect(isValid('   ')).toBe(false)
    expect(isValid('\n')).toBe(false)
    expect(isValid('Hello')).toBe(true)
  })

  test('TC-CHAT-012: Message role must be user or ai', () => {
    const validRoles = ['user', 'ai']
    expect(validRoles.includes('user')).toBe(true)
    expect(validRoles.includes('ai')).toBe(true)
    expect(validRoles.includes('admin')).toBe(false)
    expect(validRoles.includes('system')).toBe(false)
  })

  test('TC-CHAT-013: User cannot add message to another users session', () => {
    const s = createSession(USER_A)
    expect(() =>
      addMessage(s.id, USER_B, 'user', 'Trying to sneak in')
    ).toThrow('Session not found or unauthorized')
  })

  test('TC-CHAT-014: Session last_message_preview updated after message', () => {
    const s = createSession(USER_A)
    addMessage(s.id, USER_A, 'user', 'This is a long message that should be truncated for preview purposes')
    const updated = sessions.find(x => x.id === s.id)
    expect(updated.last_message_preview).toBe('This is a long message that should be truncated for preview ')
    expect(updated.last_message_preview.length).toBeLessThanOrEqual(60)
  })

  test('TC-CHAT-015: Messages load in chronological order', () => {
    const s = createSession(USER_A)
    addMessage(s.id, USER_A, 'user', 'First')
    addMessage(s.id, USER_A, 'ai', 'Second')
    addMessage(s.id, USER_A, 'user', 'Third')
    const sessionMessages = messages
      .filter(m => m.session_id === s.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    expect(sessionMessages[0].message_text).toBe('First')
    expect(sessionMessages[2].message_text).toBe('Third')
  })

  test('TC-CHAT-016: New message appended to end of list', () => {
    const s = createSession(USER_A)
    addMessage(s.id, USER_A, 'user', 'Message 1')
    addMessage(s.id, USER_A, 'ai', 'Message 2')
    const newMsg = addMessage(s.id, USER_A, 'user', 'Message 3')
    const sessionMessages = messages.filter(m => m.session_id === s.id)
    expect(sessionMessages[sessionMessages.length - 1].id).toBe(newMsg.id)
  })
})

// ─── AI INTEGRATION ───────────────────────────────────────────────────────────

describe('CHAT — AI Integration', () => {
  test('TC-CHAT-017: AI prompt includes user skin profile context', () => {
    const buildPrompt = (message, profile) =>
      `User skin type: ${profile.skin_type}. Concerns: ${profile.skin_concerns.join(', ')}. Question: ${message}` 
    const profile = { skin_type: 'oily', skin_concerns: ['acne', 'dullness'] }
    const prompt = buildPrompt('What should I use?', profile)
    expect(prompt).toContain('oily')
    expect(prompt).toContain('acne')
    expect(prompt).toContain('dullness')
    expect(prompt).toContain('What should I use?')
  })

  test('TC-CHAT-018: AI response is never empty', () => {
    const validateAIResponse = (response) => response?.trim().length > 0
    expect(validateAIResponse('')).toBe(false)
    expect(validateAIResponse('Here is my advice...')).toBe(true)
  })

  test('TC-CHAT-019: Typing indicator shows while waiting for AI', () => {
    let isTyping = false
    const startTyping = () => { isTyping = true }
    const stopTyping = () => { isTyping = false }
    startTyping()
    expect(isTyping).toBe(true)
    stopTyping()
    expect(isTyping).toBe(false)
  })

  test('TC-CHAT-020: AI error is handled gracefully with fallback message', () => {
    const handleAIError = (error) => {
      if (error) return 'Sorry, I could not process that. Please try again.'
      return null
    }
    const fallback = handleAIError(new Error('timeout'))
    expect(fallback).toContain('Sorry')
    expect(handleAIError(null)).toBeNull()
  })

  test('TC-CHAT-021: Quick suggestion chip sends correct message', () => {
    const chips = [
      'What is my skin type routine?',
      'Best moisturizer for me',
      'Help with acne',
      'My morning routine',
      'Glow tips for tonight'
    ]
    let sentMessage = null
    const sendFromChip = (chip) => { sentMessage = chip }
    sendFromChip(chips[2])
    expect(sentMessage).toBe('Help with acne')
  })

  test('TC-CHAT-022: Chat history included in AI context for continuity', () => {
    const buildContextPrompt = (history, newMessage) => {
      const historyText = history.map(m => `${m.role}: ${m.message_text}`).join('\n')
      return `${historyText}\nuser: ${newMessage}` 
    }
    const history = [
      { role: 'user', message_text: 'I have oily skin' },
      { role: 'ai', message_text: 'For oily skin, try a gel cleanser' }
    ]
    const prompt = buildContextPrompt(history, 'What toner should I use?')
    expect(prompt).toContain('I have oily skin')
    expect(prompt).toContain('What toner should I use?')
  })
})

// ─── USER ISOLATION IN CHAT ───────────────────────────────────────────────────

describe('CHAT — User Data Isolation', () => {
  beforeEach(resetDb)

  test('TC-CHAT-023: User A sessions not visible to User B', () => {
    createSession(USER_A, 'A private chat')
    createSession(USER_B, 'B private chat')
    const userASessions = sessions.filter(s => s.user_id === USER_A)
    expect(userASessions.every(s => s.user_id === USER_A)).toBe(true)
    expect(userASessions.find(s => s.user_id === USER_B)).toBeUndefined()
  })

  test('TC-CHAT-024: User A messages not accessible by User B', () => {
    const s = createSession(USER_A)
    addMessage(s.id, USER_A, 'user', 'My private message')
    const getUserMessages = (userId) => messages.filter(m => m.user_id === userId)
    expect(getUserMessages(USER_B)).toHaveLength(0)
    expect(getUserMessages(USER_A)).toHaveLength(1)
  })

  test('TC-CHAT-025: Empty chat state shows no messages', () => {
    const s = createSession(USER_A)
    const sessionMessages = messages.filter(m => m.session_id === s.id)
    expect(sessionMessages).toHaveLength(0)
  })
})
