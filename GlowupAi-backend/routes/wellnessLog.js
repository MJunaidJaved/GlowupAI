const express = require('express')
const router = express.Router()
const db = require('../database')
const auth = require('../middleware/auth')

// GET all wellness logs for current user
router.get('/', auth, (req, res) => {
  const logs = db.prepare(`
    SELECT * FROM wellness_logs
    WHERE user_id = ?
    ORDER BY log_date DESC
    LIMIT 30
  `).all(req.user.id)
  res.json(logs)
})

// CREATE or UPDATE today's wellness log
router.post('/', auth, (req, res) => {
  const { log_date, water_glasses, sleep_hours, sleep_quality } = req.body

  if (!log_date) return res.status(400).json({ error: 'log_date is required' })

  db.prepare(`
    INSERT INTO wellness_logs (user_id, log_date, water_glasses, sleep_hours, sleep_quality)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, log_date) DO UPDATE SET
      water_glasses = excluded.water_glasses,
      sleep_hours = excluded.sleep_hours,
      sleep_quality = excluded.sleep_quality
  `).run(req.user.id, log_date, water_glasses, sleep_hours, sleep_quality)

  res.json({ success: true })
})

// UPDATE wellness log by ID
router.put('/:id', auth, (req, res) => {
  const log = db.prepare(
    'SELECT * FROM wellness_logs WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id)

  if (!log) return res.status(404).json({ error: 'Log not found' })

  const { water_glasses, sleep_hours, sleep_quality } = req.body
  db.prepare(`
    UPDATE wellness_logs SET
      water_glasses = COALESCE(?, water_glasses),
      sleep_hours = COALESCE(?, sleep_hours),
      sleep_quality = COALESCE(?, sleep_quality)
    WHERE id = ?
  `).run(water_glasses, sleep_hours, sleep_quality, req.params.id)

  res.json({ success: true })
})

module.exports = router
