const path = require('path');
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const app = express()

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https:", "http:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      mediaSrc: ["'self'", "https:", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS — allow your frontend to talk to this server
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true);
  },
  credentials: true
}))

// Parse JSON request bodies
app.use(express.json())

// Mount all routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/skin-profile', require('./routes/skinProfile'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/glow-progress', require('./routes/glowProgress'))
app.use('/api/skin-diary', require('./routes/skinDiary'))
app.use('/api/wellness', require('./routes/wellnessLog'))
app.use('/api/routine', require('./routes/routine'))
app.use('/api/checklist', require('./routes/checklist'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/products', require('./routes/products'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
