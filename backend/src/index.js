const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3');
const postRoutes = require('./routes/postRoutes');
const authorRoutes = require('./routes/authorRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/author', authorRoutes);


if (!process.env.SQLITE_PATH) {
  console.error('❌ SQLITE_PATH .env dosyasında tanımlı değil!');
  process.exit(1);
}

const dbPath = process.env.SQLITE_PATH;
const db = new sqlite3.Database(dbPath);


// db nesnesini ihtiyaç duyan diğer dosyalara da aktarmak gerekirse:
// module.exports = db;

app.use('/api', postRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
