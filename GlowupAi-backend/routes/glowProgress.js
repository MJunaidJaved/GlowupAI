const express = require('express')
const router = express.Router()
const db = require('../database')
const auth = require('../middleware/auth')

// GET all check-ins for current user
router.get('/', auth, (req, res) => {
  const checkIns = db.prepare(`
    SELECT * FROM glow_progress
    WHERE user_id = ?
    ORDER BY week_date DESC
  `).all(req.user.id)
  res.json(checkIns)
})

// CREATE or UPDATE a weekly check-in
// Uses INSERT OR REPLACE so if user submits again for same week it updates
router.post('/', auth, (req, res) => {
  const { week_date, acne_level, hydration, glow, redness, texture, dark_spots, notes } = req.body

  if (!week_date) return res.status(400).json({ error: 'week_date is required' })

  db.prepare(`
    INSERT INTO glow_progress
      (user_id, week_date, acne_level, hydration, glow, redness, texture, dark_spots, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, week_date) DO UPDATE SET
      acne_level = excluded.acne_level,
      hydration = excluded.hydration,
      glow = excluded.glow,
      redness = excluded.redness,
      texture = excluded.texture,
      dark_spots = excluded.dark_spots,
      notes = excluded.notes
  `).run(req.user.id, week_date, acne_level, hydration, glow, redness, texture, dark_spots, notes)

  res.json({ success: true })
})

module.exports = router
