const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 8080;

// Log the directory structure for debugging
async function logDirectoryStructure(dir) {
  try {
    const files = await fs.readdir(dir);
    console.log(`Contents of ${dir}:`, files);
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
}

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Database setup
let db;
(async () => {
  try {
    // Log current directory structure
    console.log('Current working directory:', process.cwd());
    await logDirectoryStructure(process.cwd());
    await logDirectoryStructure(__dirname);

    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
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
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

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

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  // Try to find index.html in several possible locations
  const possiblePaths = [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'app', 'index.html'),
    path.join(__dirname, 'dist', 'index.html'),
    path.join(__dirname, 'public', 'index.html')
  ];

  // Log all possible paths for debugging
  console.log('Looking for index.html in these locations:');
  possiblePaths.forEach(p => console.log(p));

  // Try each path
  for (const htmlPath of possiblePaths) {
    if (fs.existsSync(htmlPath)) {
      console.log('Found index.html at:', htmlPath);
      return res.sendFile(htmlPath);
    }
  }

  // If no index.html is found, return a 404
  res.status(404).send('index.html not found in any expected location');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
