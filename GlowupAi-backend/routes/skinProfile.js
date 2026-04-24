const express = require('express')
const router = express.Router()
const db = require('../database')
const auth = require('../middleware/auth')

// All routes here require authentication
// GET current user's skin profile
router.get('/', auth, (req, res) => {
  const profile = db.prepare(
    'SELECT * FROM skin_profiles WHERE user_id = ?'
  ).get(req.user.id)

  if (!profile) return res.status(404).json({ error: 'Profile not found' })

  // Parse JSON strings back to arrays
  profile.skin_concerns = JSON.parse(profile.skin_concerns || '[]')
  res.json(profile)
})

// UPDATE skin profile (used during onboarding and settings)
router.put('/', auth, (req, res) => {
  const {
    skin_type, skin_concerns, water_intake,
    sleep_hours, diet_type, beauty_goal, onboarding_complete
  } = req.body

  db.prepare(`
    UPDATE skin_profiles SET
      skin_type = COALESCE(?, skin_type),
      skin_concerns = COALESCE(?, skin_concerns),
      water_intake = COALESCE(?, water_intake),
      sleep_hours = COALESCE(?, sleep_hours),
      diet_type = COALESCE(?, diet_type),
      beauty_goal = COALESCE(?, beauty_goal),
      onboarding_complete = COALESCE(?, onboarding_complete),
      updated_at = datetime('now')
    WHERE user_id = ?
  `).run(
    skin_type,
    skin_concerns ? JSON.stringify(skin_concerns) : null,
    water_intake,
    sleep_hours,
    diet_type,
    beauty_goal,
    onboarding_complete !== undefined ? (onboarding_complete ? 1 : 0) : null,
    req.user.id
  )

  res.json({ success: true })
})

module.exports = router
