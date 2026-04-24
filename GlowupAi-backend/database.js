const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'glowup.db'))

// Enable WAL mode — makes SQLite faster for concurrent reads
db.pragma('journal_mode = WAL')
// Enable foreign key enforcement — SQLite does not enforce these by default
db.pragma('foreign_keys = ON')

const setupDatabase = () => {

  // USERS TABLE
  // Stores every registered user account
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name   TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      password    TEXT NOT NULL,
      created_at  TEXT DEFAULT (datetime('now'))
    )
  `)

  // SKIN PROFILES TABLE
  // Stores onboarding answers — one row per user
  // skin_concerns is stored as a JSON string because SQLite does not have arrays
  db.exec(`
    CREATE TABLE IF NOT EXISTS skin_profiles (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id               INTEGER NOT NULL UNIQUE,
      skin_type             TEXT,
      skin_concerns         TEXT,
      water_intake          TEXT,
      sleep_hours           TEXT,
      diet_type             TEXT,
      beauty_goal           TEXT,
      onboarding_complete   INTEGER DEFAULT 0,
      created_at            TEXT DEFAULT (datetime('now')),
      updated_at            TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // CHAT SESSIONS TABLE
  // Each conversation is one session — a user can have many sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id               INTEGER NOT NULL,
      title                 TEXT NOT NULL DEFAULT 'New Chat',
      last_message_preview  TEXT,
      created_at            TEXT DEFAULT (datetime('now')),
      updated_at            TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // CHAT MESSAGES TABLE
  // Every message sent or received in every session
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id    INTEGER NOT NULL,
      user_id       INTEGER NOT NULL,
      role          TEXT NOT NULL CHECK(role IN ('user', 'ai')),
      message_text  TEXT NOT NULL,
      created_at    TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // ROUTINES TABLE
  // AM and PM routines — each user has two rows, one per routine_type
  // steps is stored as JSON string
  db.exec(`
    CREATE TABLE IF NOT EXISTS routines (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL,
      routine_type  TEXT NOT NULL CHECK(routine_type IN ('am', 'pm')),
      steps         TEXT NOT NULL DEFAULT '[]',
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, routine_type),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // DAILY CHECKLISTS TABLE
  // Tracks which routine steps were completed on which day
  // completed_steps stored as JSON string array
  // One row per user per date — enforced by UNIQUE constraint
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_checklists (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id           INTEGER NOT NULL,
      date              TEXT NOT NULL,
      completed_steps   TEXT NOT NULL DEFAULT '[]',
      created_at        TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // GLOW PROGRESS TABLE
  // Weekly skin check-in ratings
  // One row per user per week_date — enforced by UNIQUE constraint
  db.exec(`
    CREATE TABLE IF NOT EXISTS glow_progress (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      week_date   TEXT NOT NULL,
      acne_level  INTEGER CHECK(acne_level BETWEEN 1 AND 10),
      hydration   INTEGER CHECK(hydration BETWEEN 1 AND 10),
      glow        INTEGER CHECK(glow BETWEEN 1 AND 10),
      redness     INTEGER CHECK(redness BETWEEN 1 AND 10),
      texture     INTEGER CHECK(texture BETWEEN 1 AND 10),
      dark_spots  INTEGER CHECK(dark_spots BETWEEN 1 AND 10),
      notes       TEXT,
      created_at  TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, week_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // SKIN DIARY TABLE
  // Daily personal skin journal entries
  // One row per user per date — enforced by UNIQUE constraint
  db.exec(`
    CREATE TABLE IF NOT EXISTS skin_diary (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id           INTEGER NOT NULL,
      entry_date        TEXT NOT NULL,
      mood              TEXT CHECK(mood IN ('glowing','good','okay','dry','breaking_out')),
      skin_notes        TEXT,
      lifestyle_notes   TEXT,
      created_at        TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, entry_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // WELLNESS LOGS TABLE
  // Daily water and sleep tracking
  // One row per user per date — enforced by UNIQUE constraint
  db.exec(`
    CREATE TABLE IF NOT EXISTS wellness_logs (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER NOT NULL,
      log_date        TEXT NOT NULL,
      water_glasses   INTEGER DEFAULT 0 CHECK(water_glasses BETWEEN 0 AND 8),
      sleep_hours     REAL,
      sleep_quality   TEXT CHECK(sleep_quality IN ('poor','okay','great')),
      created_at      TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, log_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // PRODUCTS TABLE
  // Shared catalog — no user_id, visible to all logged-in users
  // Arrays stored as JSON strings
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      name              TEXT NOT NULL,
      category          TEXT NOT NULL,
      description       TEXT,
      skin_types        TEXT DEFAULT '[]',
      concerns          TEXT DEFAULT '[]',
      key_ingredients   TEXT DEFAULT '[]',
      price_range       TEXT,
      created_at        TEXT DEFAULT (datetime('now'))
    )
  `)

  // Insert default products if table is empty
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get()
  if (productCount.count === 0) {
    insertDefaultProducts()
  }

  console.log('Database tables created successfully')
}

const insertDefaultProducts = () => {
  const defaultProducts = [
    {
      name: 'Gentle Cleanser',
      category: 'cleanser',
      description: 'A gentle, pH-balanced cleanser suitable for all skin types.',
      skin_types: JSON.stringify(['dry', 'sensitive', 'oily', 'combination']),
      concerns: JSON.stringify(['sensitivity', ' dryness']),
      key_ingredients: JSON.stringify(['glycerin', 'aloe vera']),
      price_range: '$'
    },
    {
      name: 'Vitamin C Serum',
      category: 'serum',
      description: 'Brightening serum with 15% vitamin C to reduce dark spots.',
      skin_types: JSON.stringify(['normal', 'combination', 'oily']),
      concerns: JSON.stringify(['dark spots', 'dullness', 'uneven texture']),
      key_ingredients: JSON.stringify(['vitamin C', 'hyaluronic acid']),
      price_range: '$$'
    },
    {
      name: 'Hyaluronic Acid Moisturizer',
      category: 'moisturizer',
      description: 'Deep hydration with hyaluronic acid for plump, glowing skin.',
      skin_types: JSON.stringify(['dry', 'normal', 'sensitive']),
      concerns: JSON.stringify(['dryness', 'fine lines']),
      key_ingredients: JSON.stringify(['hyaluronic acid', 'ceramides']),
      price_range: '$$'
    },
    {
      name: 'Niacinamide Serum',
      category: 'serum',
      description: 'Reduces pore appearance and controls oil production.',
      skin_types: JSON.stringify(['oily', 'combination', 'acne-prone']),
      concerns: JSON.stringify(['acne', 'large pores', 'uneven texture']),
      key_ingredients: JSON.stringify(['niacinamide', 'zinc']),
      price_range: '$'
    },
    {
      name: 'Retinol Night Cream',
      category: 'moisturizer',
      description: 'Anti-aging night cream with encapsulated retinol.',
      skin_types: JSON.stringify(['normal', 'combination']),
      concerns: JSON.stringify(['fine lines', 'uneven texture', 'dark spots']),
      key_ingredients: JSON.stringify(['retinol', 'peptides']),
      price_range: '$$$'
    },
    {
      name: 'SPF 50 Sunscreen',
      category: 'sunscreen',
      description: 'Broad spectrum protection with lightweight, non-greasy formula.',
      skin_types: JSON.stringify(['all']),
      concerns: JSON.stringify(['sun protection', 'premature aging']),
      key_ingredients: JSON.stringify(['zinc oxide', 'vitamin E']),
      price_range: '$$'
    },
    {
      name: 'Salicylic Acid Cleanser',
      category: 'cleanser',
      description: 'BHA cleanser to unclog pores and prevent breakouts.',
      skin_types: JSON.stringify(['oily', 'acne-prone']),
      concerns: JSON.stringify(['acne', 'blackheads', 'congested pores']),
      key_ingredients: JSON.stringify(['salicylic acid', 'tea tree']),
      price_range: '$'
    },
    {
      name: 'Hydrating Toner',
      category: 'toner',
      description: 'Alcohol-free toner to prep skin and restore pH balance.',
      skin_types: JSON.stringify(['all']),
      concerns: JSON.stringify(['dryness', 'sensitivity']),
      key_ingredients: JSON.stringify(['rose water', 'glycerin']),
      price_range: '$'
    }
  ]

  const insert = db.prepare(`
    INSERT INTO products (name, category, description, skin_types, concerns, key_ingredients, price_range)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  defaultProducts.forEach(product => {
    insert.run(
      product.name,
      product.category,
      product.description,
      product.skin_types,
      product.concerns,
      product.key_ingredients,
      product.price_range
    )
  })

  console.log('Default products inserted')
}

setupDatabase()

module.exports = db
