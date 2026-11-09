const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'campuspulse.db');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      complaint_number TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Electricity','Water','Wi-Fi','Cleanliness','Hostel','Classroom','Infrastructure','Other')),
      location TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low','Medium','High','Critical')),
      status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Submitted','In Progress','Resolved')),
      user_id TEXT NOT NULL,
      resolved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);

    CREATE TABLE IF NOT EXISTS status_history (
      id TEXT PRIMARY KEY,
      complaint_id TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      changed_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (changed_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_status_history_complaint ON status_history(complaint_id);
  `);

  console.log('Database initialized successfully');
  return db;
}

module.exports = { getDB, initDB };
