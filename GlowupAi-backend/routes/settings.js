const express = require('express')
const router = express.Router()
const db = require('../database')
const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs')

// UPDATE user profile (name, email)
router.put('/profile', auth, (req, res) => {
  const { full_name, email } = req.body

  if (email) {
    const existing = db.prepare(
      'SELECT id FROM users WHERE email = ? AND id != ?'
    ).get(email, req.user.id)
    if (existing) return res.status(409).json({ error: 'Email already in use' })
  }

  db.prepare(`
    UPDATE users SET
      full_name = COALESCE(?, full_name),
      email = COALESCE(?, email)
    WHERE id = ?
  `).run(full_name, email, req.user.id)

  res.json({ success: true })
})

// CHANGE password
router.put('/password', auth, (req, res) => {
  const { current_password, new_password } = req.body

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  const valid = bcrypt.compareSync(current_password, user.password)
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })

  const hashed = bcrypt.hashSync(new_password, 12)
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id)
  res.json({ success: true })
})

// DELETE account — removes user and all their data via CASCADE
router.delete('/account', auth, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id)
  res.json({ success: true })
})

module.exports = router
