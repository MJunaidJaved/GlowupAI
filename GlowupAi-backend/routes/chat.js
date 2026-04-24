const express = require('express')
const router = express.Router()
const db = require('../database')
const auth = require('../middleware/auth')

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const MODEL = process.env.AI_MODEL || 'google/gemini-2.0-flash-lite-001'

const callAI = async (messages) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
    }),
  })
  const data = await response.json()
  if (!data.choices || !data.choices[0]) throw new Error(data.error?.message || 'AI request failed')
  return data.choices[0].message.content
}

// GET all chat sessions for current user
router.get('/sessions', auth, (req, res) => {
  const sessions = db.prepare(`
    SELECT * FROM chat_sessions
    WHERE user_id = ?
    ORDER BY updated_at DESC
  `).all(req.user.id)
  res.json(sessions)
})

// CREATE new chat session
router.post('/sessions', auth, (req, res) => {
  const { title } = req.body
  const result = db.prepare(`
    INSERT INTO chat_sessions (user_id, title)
    VALUES (?, ?)
  `).run(req.user.id, title || 'New Chat')

  res.status(201).json({ id: result.lastInsertRowid })
})

// GET all messages for a specific session
// Critical: checks user_id on the session so user can only read their own sessions
router.get('/sessions/:sessionId/messages', auth, (req, res) => {
  const session = db.prepare(
    'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?'
  ).get(req.params.sessionId, req.user.id)

  if (!session) return res.status(404).json({ error: 'Session not found' })

  const messages = db.prepare(`
    SELECT * FROM chat_messages
    WHERE session_id = ?
    ORDER BY created_at ASC
  `).all(req.params.sessionId)

  res.json(messages)
})

// ADD message to session
router.post('/sessions/:sessionId/messages', auth, (req, res) => {
  const { role, message_text } = req.body

  const session = db.prepare(
    'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?'
  ).get(req.params.sessionId, req.user.id)

  if (!session) return res.status(404).json({ error: 'Session not found' })

  const result = db.prepare(`
    INSERT INTO chat_messages (session_id, user_id, role, message_text)
    VALUES (?, ?, ?, ?)
  `).run(req.params.sessionId, req.user.id, role, message_text)

  // Update session's last_message_preview
  db.prepare(`
    UPDATE chat_sessions SET
      last_message_preview = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(message_text.slice(0, 60), req.params.sessionId)

  res.status(201).json({ id: result.lastInsertRowid })
})

// UPDATE session (e.g. last_message_preview)
router.put('/sessions/:sessionId', auth, (req, res) => {
  const session = db.prepare(
    'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?'
  ).get(req.params.sessionId, req.user.id)

  if (!session) return res.status(404).json({ error: 'Session not found' })

  const { last_message_preview } = req.body
  db.prepare(`
    UPDATE chat_sessions SET
      last_message_preview = COALESCE(?, last_message_preview),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(last_message_preview || null, req.params.sessionId)

  res.json({ success: true })
})

// AI RESPONSE — generates an AI reply using the user's full data as context
router.post('/ai-response', auth, async (req, res) => {
  try {
    const { message, skin_context } = req.body

    if (!message) return res.status(400).json({ error: 'message is required' })

    // Fetch user's skin profile for richer context
    const profile = db.prepare(
      'SELECT * FROM skin_profiles WHERE user_id = ?'
    ).get(req.user.id)

    // Fetch recent wellness logs
    const wellnessLogs = db.prepare(
      "SELECT * FROM wellness_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 7"
    ).all(req.user.id)

    // Fetch recent diary entries
    const diaryEntries = db.prepare(
      "SELECT * FROM skin_diary WHERE user_id = ? ORDER BY entry_date DESC LIMIT 5"
    ).all(req.user.id)

    // Fetch routines
    const routines = db.prepare(
      'SELECT * FROM routines WHERE user_id = ?'
    ).all(req.user.id)

    let systemPrompt = 'You are Glow-Up Advisor, a friendly and knowledgeable AI skincare companion. Give personalized, practical advice. Keep responses concise but helpful. Use emojis sparingly.'

    if (profile) {
      const concerns = profile.skin_concerns ? JSON.parse(profile.skin_concerns).join(', ') : 'none'
      systemPrompt += `\n\nUser's skin profile:\n- Skin type: ${profile.skin_type || 'unknown'}\n- Concerns: ${concerns}\n- Water intake: ${profile.water_intake || 'unknown'}\n- Sleep hours: ${profile.sleep_hours || 'unknown'}\n- Diet: ${profile.diet_type || 'unknown'}\n- Beauty goal: ${profile.beauty_goal || 'unknown'}\n- Onboarding complete: ${profile.onboarding_complete ? 'yes' : 'no'}`
      systemPrompt += `\n\nIMPORTANT: Always reference the user's specific skin type, concerns, and goals in your response. For example, say "Since you have ${profile.skin_type || 'unknown'} skin..." or "Given your concern about ${concerns}..." — make it clear your advice is personalized for them, not generic.`
    }

    if (wellnessLogs.length > 0) {
      const latest = wellnessLogs[0]
      const avgWater = (wellnessLogs.reduce((a, l) => a + (l.water_glasses || 0), 0) / wellnessLogs.length).toFixed(1)
      const avgSleep = (wellnessLogs.reduce((a, l) => a + (l.sleep_hours || 0), 0) / wellnessLogs.length).toFixed(1)
      systemPrompt += `\n\nUser's wellness data (last 7 days):\n- Average water: ${avgWater} glasses/day (latest: ${latest.water_glasses})\n- Average sleep: ${avgSleep} hrs/night (latest: ${latest.sleep_hours}, quality: ${latest.sleep_quality})\nReference this when giving lifestyle advice.`
    }

    if (diaryEntries.length > 0) {
      const latestDiary = diaryEntries[0]
      systemPrompt += `\n\nLatest skin diary (${latestDiary.entry_date}): Mood: ${latestDiary.mood}. Notes: ${latestDiary.skin_notes || 'none'}. Lifestyle: ${latestDiary.lifestyle_notes || 'none'}\nUse this to understand how their skin has been recently.`
    }

    if (routines.length > 0) {
      const routineSummary = routines.map(r => {
        const steps = JSON.parse(r.steps || '[]')
        const stepNames = steps.map(s => s.product_name || s.name || s.product_type || 'step').join(', ')
        return `${r.routine_type.toUpperCase()}: ${stepNames}`
      }).join(' | ')
      systemPrompt += `\n\nUser's current routine: ${routineSummary}\nReference their existing products when suggesting changes.`
    }

    if (skin_context) {
      systemPrompt += `\n\nAdditional context: ${skin_context}`
    }

    const aiMessage = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ])

    res.json({ message: aiMessage })
  } catch (error) {
    console.error('AI response error:', error.message)
    res.status(500).json({ error: 'Failed to generate AI response' })
  }
})

// GENERATE ROUTINE — creates AM/PM routine based on skin profile
router.post('/generate-routine', auth, async (req, res) => {
  try {
    const { skin_type, concerns, goal } = req.body

    const profile = db.prepare(
      'SELECT * FROM skin_profiles WHERE user_id = ?'
    ).get(req.user.id)

    const effectiveType = skin_type || profile?.skin_type || 'normal'
    const effectiveConcerns = concerns || (profile?.skin_concerns ? JSON.parse(profile.skin_concerns) : [])
    const effectiveGoal = goal || profile?.beauty_goal || 'healthy skin'

    const prompt = `Generate a personalized skincare routine for this user:
- Skin type: ${effectiveType}
- Concerns: ${effectiveConcerns.join(', ') || 'none'}
- Goal: ${effectiveGoal}

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "am": [
    {"product_type": "Cleanser", "product_name": "Gentle Hydrating Cleanser", "instruction": "Massage onto damp skin for 60 seconds, then rinse with lukewarm water."}
  ],
  "pm": [
    {"product_type": "Cleanser", "product_name": "Micellar Water", "instruction": "Apply on cotton pad and sweep across face to remove makeup."}
  ]
}

Each routine should have 4-6 steps ordered from cleanser to final product.
- product_type: the category (Cleanser, Toner, Serum, Moisturizer, Sunscreen, etc.)
- product_name: a specific product recommendation suited to the user's ${effectiveType} skin type targeting ${effectiveConcerns.join(', ') || 'general health'}
- instruction: a short how-to-use tip specific to their skin type and concerns
Be specific to the user's skin type and concerns.`

    const aiMessage = await callAI([
      { role: 'system', content: 'You are a skincare expert. Return only valid JSON, no markdown fences, no extra text.' },
      { role: 'user', content: prompt },
    ])

    // Parse the AI response — strip markdown fences if present
    let cleaned = aiMessage.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const routine = JSON.parse(cleaned)
    res.json(routine)
  } catch (error) {
    console.error('Generate routine error:', error.message)
    res.status(500).json({ error: 'Failed to generate routine' })
  }
})

// DELETE a chat session and all its messages
router.delete('/sessions/:sessionId', auth, (req, res) => {
  const session = db.prepare(
    'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?'
  ).get(req.params.sessionId, req.user.id)

  if (!session) return res.status(404).json({ error: 'Session not found' })

  // Messages are deleted automatically because of ON DELETE CASCADE
  db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(req.params.sessionId)
  res.json({ success: true })
})

module.exports = router
