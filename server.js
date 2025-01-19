const express = require('express');
const { createRequestHandler } = require('@remix-run/express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 8080;

// Database setup
let db;
(async () => {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // SQLite database setup
    const dbPath = path.join(dataDir, 'bolt.db');
    console.log('Database path:', dbPath);
    
    try {
      await fs.access(dbPath);
    } catch {
      await fs.writeFile(dbPath, '');
    }
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    await initializeDatabase(db);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    console.error('Continuing without database...');
  }
})();

async function initializeDatabase(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Serve public files
app.use(express.static('public'));
app.use(express.static('dist/client'));

// API Routes
app.post('/api/*', async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// All other routes go to Remix
app.all(
  '*',
  createRequestHandler({
    build: require('./dist/server/index.js'),
    mode: process.env.NODE_ENV,
  })
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
