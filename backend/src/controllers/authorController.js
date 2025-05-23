const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../../blog.sqlite');
const db = new sqlite3.Database(dbPath);

// GET /api/author
exports.getAuthor = (req, res) => {
  db.get("SELECT * FROM authors WHERE id = 1", (err, row) => {
    if (err) return res.status(500).json({ error: "Failed to fetch author." });
    if (!row) return res.status(404).json({ error: "Author not found." });
    res.json(row);
  });
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

  const query = `UPDATE authors SET ${updates.join(', ')} WHERE id = 1`;

  db.run(query, values, function (err) {
    if (err) return res.status(500).json({ error: "Failed to update author." });
    res.json({ message: "Author updated successfully." });
  });
};

