const express = require('express')
const router = express.Router()
const db = require('../database')
const auth = require('../middleware/auth')

// GET both routines for current user
router.get('/', auth, (req, res) => {
  const routines = db.prepare(
    'SELECT * FROM routines WHERE user_id = ?'
  ).all(req.user.id)

  // Parse steps JSON back to array
  const parsed = routines.map(r => ({ ...r, steps: JSON.parse(r.steps) }))
  res.json(parsed)
})

// CREATE or UPDATE a routine
router.post('/', auth, (req, res) => {
  const { routine_type, steps } = req.body

  if (!routine_type || !steps) {
    return res.status(400).json({ error: 'routine_type and steps are required' })
  }

  db.prepare(`
    INSERT INTO routines (user_id, routine_type, steps)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, routine_type) DO UPDATE SET
      steps = excluded.steps,
      updated_at = datetime('now')
  `).run(req.user.id, routine_type, JSON.stringify(steps))

  res.json({ success: true })
})

// DELETE a routine
router.delete('/:id', auth, (req, res) => {
  const routine = db.prepare(
    'SELECT * FROM routines WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id)

  if (!routine) return res.status(404).json({ error: 'Routine not found' })

  db.prepare('DELETE FROM routines WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

module.exports = router
