const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the app directory
app.use(express.static(path.join(__dirname, 'app')));
app.use(express.json());

// Database setup
let db;
(async () => {
  // SQLite database will be created in the data directory
  const dbPath = path.join(__dirname, 'data', 'bolt.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  // Ensure the database is initialized with required tables
  await initializeDatabase(db);
})();

async function initializeDatabase(db) {
  // Add your table creation statements here
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    -- Add other table creation statements as needed
  `);
}

// API Routes
app.post('/api/*', async (req, res) => {
  try {
    // Handle API requests here
    // You'll need to implement the specific API endpoints based on your application needs
    res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
