const express = require('express')
const router = express.Router()
const db = require('../database')
const auth = require('../middleware/auth')

// GET checklist for a specific date
router.get('/:date', auth, (req, res) => {
  const checklist = db.prepare(
    'SELECT * FROM daily_checklists WHERE user_id = ? AND date = ?'
  ).get(req.user.id, req.params.date)

  if (!checklist) return res.json({ date: req.params.date, completed_steps: [] })

  checklist.completed_steps = JSON.parse(checklist.completed_steps)
  res.json(checklist)
})

// SAVE checklist for a specific date
router.post('/', auth, (req, res) => {
  const { date, completed_steps } = req.body

  db.prepare(`
    INSERT INTO daily_checklists (user_id, date, completed_steps)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      completed_steps = excluded.completed_steps
  `).run(req.user.id, date, JSON.stringify(completed_steps))

  res.json({ success: true })
})

// UPDATE checklist by ID
router.put('/:id', auth, (req, res) => {
  const checklist = db.prepare(
    'SELECT * FROM daily_checklists WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id)

  if (!checklist) return res.status(404).json({ error: 'Checklist not found' })

  const { completed_steps } = req.body
  db.prepare(`
    UPDATE daily_checklists SET
      completed_steps = COALESCE(?, completed_steps)
    WHERE id = ?
  `).run(completed_steps ? JSON.stringify(completed_steps) : null, req.params.id)

  res.json({ success: true })
})

module.exports = router
