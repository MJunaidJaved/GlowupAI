const express = require('express')
const router = express.Router()
const db = require('../database')
const auth = require('../middleware/auth')

// GET all diary entries for current user
router.get('/', auth, (req, res) => {
  const entries = db.prepare(`
    SELECT * FROM skin_diary
    WHERE user_id = ?
    ORDER BY entry_date DESC
  `).all(req.user.id)
  res.json(entries)
})

// CREATE or UPDATE diary entry for a specific date
router.post('/', auth, (req, res) => {
  const { entry_date, mood, skin_notes, lifestyle_notes } = req.body

  if (!entry_date) return res.status(400).json({ error: 'entry_date is required' })

  db.prepare(`
    INSERT INTO skin_diary (user_id, entry_date, mood, skin_notes, lifestyle_notes)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, entry_date) DO UPDATE SET
      mood = excluded.mood,
      skin_notes = excluded.skin_notes,
      lifestyle_notes = excluded.lifestyle_notes
  `).run(req.user.id, entry_date, mood, skin_notes, lifestyle_notes)

  res.json({ success: true })
})

// DELETE diary entry
router.delete('/:id', auth, (req, res) => {
  const entry = db.prepare(
    'SELECT * FROM skin_diary WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id)

  if (!entry) return res.status(404).json({ error: 'Entry not found' })

  db.prepare('DELETE FROM skin_diary WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

module.exports = router
