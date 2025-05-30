const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const path = require('path');
dotenv.config();

if (!process.env.SQLITE_PATH) {
  console.error('❌ SQLITE_PATH .env dosyasında tanımlı değil!');
  process.exit(1);
}

const dbPath = process.env.SQLITE_PATH;
const db = new Database(dbPath);

// GET /api/author
exports.getAuthor = (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM authors WHERE id = 1").get();
    if (!row) return res.status(404).json({ error: "Author not found." });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch author." });
  }
};

// PUT /api/author
exports.updateAuthor = (req, res) => {
  const allowedFields = [
    "name", "username", "email", "bio",
    "github", "linkedin", "scholar",
    "title", "description"
  ];

  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields provided." });
  }

  try {
    db.prepare(`UPDATE authors SET ${updates.join(', ')} WHERE id = 1`).run(...values);
    res.json({ message: "Author updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update author." });
  }
};
