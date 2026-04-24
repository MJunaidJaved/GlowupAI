const express = require('express')
const router = express.Router()
const db = require('../database')
const auth = require('../middleware/auth')

// GET all products (public catalog)
router.get('/', auth, (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY name').all()
  
  // Parse JSON strings back to arrays
  const parsed = products.map(p => ({
    ...p,
    skin_types: JSON.parse(p.skin_types || '[]'),
    concerns: JSON.parse(p.concerns || '[]'),
    key_ingredients: JSON.parse(p.key_ingredients || '[]')
  }))
  
  res.json(parsed)
})

// GET single product by ID
router.get('/:id', auth, (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  
  if (!product) return res.status(404).json({ error: 'Product not found' })
  
  product.skin_types = JSON.parse(product.skin_types || '[]')
  product.concerns = JSON.parse(product.concerns || '[]')
  product.key_ingredients = JSON.parse(product.key_ingredients || '[]')
  
  res.json(product)
})

module.exports = router
