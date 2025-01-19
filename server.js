const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the app directory
app.use(express.static(path.join(__dirname, 'app')));
app.use(express.json());

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
    
    // Log the data directory for debugging
    console.log('Data directory:', dataDir);
    console.log('Current working directory:', process.cwd());
    
    // SQLite database will be created in the data directory
    const dbPath = path.join(dataDir, 'bolt.db');
    console.log('Database path:', dbPath);
    
    // Try to create an empty file if it doesn't exist
    try {
      await fs.access(dbPath);
    } catch {
      await fs.writeFile(dbPath, '');
    }
    
    // Open the database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Ensure the database is initialized with required tables
    await initializeDatabase(db);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
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

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
