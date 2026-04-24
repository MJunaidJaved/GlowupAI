const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../database')

// SIGNUP
// POST /api/auth/signup
// Body: { full_name, email, password }
router.post('/signup', (req, res) => {
  const { full_name, email, password } = req.body

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  // Check if email already exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  // Hash the password — never store plain text passwords
  const hashedPassword = bcrypt.hashSync(password, 12)

  // Insert the new user
  const insert = db.prepare(
    'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)'
  )
  const result = insert.run(full_name, email, hashedPassword)

  // Create an empty skin profile for this user
  db.prepare(
    'INSERT INTO skin_profiles (user_id) VALUES (?)'
  ).run(result.lastInsertRowid)

  // Generate JWT token
  const token = jwt.sign(
    { id: result.lastInsertRowid, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.status(201).json({
    token,
    user: {
      id: result.lastInsertRowid,
      full_name,
      email
    }
  })
})

// LOGIN
// POST /api/auth/login
// Body: { email, password }
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  // Find user by email
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  // Compare the provided password with the stored hash
  const passwordValid = bcrypt.compareSync(password, user.password)
  if (!passwordValid) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email
    }
  })
})

// GET CURRENT USER
// GET /api/auth/me
// Requires: Authorization header with token
const authenticateToken = require('../middleware/auth')
router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare(
    'SELECT id, full_name, email, created_at FROM users WHERE id = ?'
  ).get(req.user.id)

  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

module.exports = router
