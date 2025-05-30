const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const path = require('path');
const slugify = require('../utils/slugify');
dotenv.config();

if (!process.env.SQLITE_PATH) {
  console.error('❌ SQLITE_PATH .env dosyasında tanımlı değil!');
  process.exit(1);
}

const dbPath = process.env.SQLITE_PATH;
const db = new Database(dbPath);


// Helper
function splitCategories(categories) {
  return categories
    ? categories.split('||').map(item => {
        const [name, slug] = item.split(':');
        return { name, slug };
      })
    : [];
}

// getAllPosts
exports.getAllPosts = (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT p.*, 
             a.id AS author_id, a.name AS author_name, a.username AS author_username,
             GROUP_CONCAT(c.name || ':' || c.slug, '||') AS categories
      FROM posts p
      JOIN authors a ON p.author_id = a.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.type = 'post'
      GROUP BY p.id
      ORDER BY datetime(p.published_at) DESC
    `).all();

    const result = rows.map(row => {
      const { author_id, author_name, author_username, categories, ...rest } = row;
      return {
        ...rest,
        categories: splitCategories(categories),
        author: { id: author_id, name: author_name, username: author_username }
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve posts.', detail: err.message });
  }
};

// getPostsByCategory
exports.getPostsByCategory = (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT p.*, 
             a.id AS author_id, a.name AS author_name, a.username AS author_username,
             GROUP_CONCAT(c.name || ':' || c.slug, '||') AS categories
      FROM posts p
      JOIN authors a ON p.author_id = a.id
      JOIN post_categories pc ON p.id = pc.post_id
      JOIN categories c ON pc.category_id = c.id
      WHERE c.slug = ? AND p.type = 'post'
      GROUP BY p.id
      ORDER BY datetime(p.published_at) DESC
    `).all(req.params.slug);

    const result = rows.map(row => {
      const { author_id, author_name, author_username, categories, ...rest } = row;
      return {
        ...rest,
        categories: splitCategories(categories),
        author: { id: author_id, name: author_name, username: author_username }
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve posts by category.', detail: err.message });
  }
};

// getPostById
exports.getPostById = (req, res) => {
  try {
    const row = db.prepare(`
      SELECT p.*, 
             a.id AS author_id, a.name AS author_name, a.username AS author_username,
             GROUP_CONCAT(c.name || ':' || c.slug, '||') AS categories
      FROM posts p
      JOIN authors a ON p.author_id = a.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.id = ? AND p.type = 'post'
      GROUP BY p.id
    `).get(req.params.id);

    if (!row) return res.status(404).json({ error: 'Post not found.' });

    const { author_id, author_name, author_username, categories, ...rest } = row;
    res.json({
      ...rest,
      categories: splitCategories(categories),
      author: { id: author_id, name: author_name, username: author_username }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve post.', detail: err.message });
  }
};

// getPostBySlug
exports.getPostBySlug = (req, res) => {
  try {
    const row = db.prepare(`
      SELECT p.*, 
             a.id AS author_id, a.name AS author_name, a.username AS author_username,
             GROUP_CONCAT(c.name || ':' || c.slug, '||') AS categories
      FROM posts p
      JOIN authors a ON p.author_id = a.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.slug = ?
      GROUP BY p.id
    `).get(req.params.slug);

    if (!row) return res.status(404).json({ error: 'Post not found.' });

    const { author_id, author_name, author_username, categories, ...rest } = row;
    res.json({
      ...rest,
      categories: splitCategories(categories),
      author: { id: author_id, name: author_name, username: author_username }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve post.', detail: err.message });
  }
};

// createPost
exports.createPost = (req, res) => {
  const {
    title, slug, content, excerpt,
    published_at, author_id, featured_image,
    category_ids, type = 'post',
    showInHeader = 0,
    showInFooter = 0
  } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const finalSlug = slug || slugify(title);
  const query = `
    INSERT INTO posts (
      title, slug, content, excerpt,
      published_at, author_id, featured_image,
      type, showInHeader, showInFooter
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    const result = db.prepare(query).run(
      title,
      finalSlug,
      content,
      excerpt || '',
      published_at || new Date().toISOString(),
      author_id || 1,
      featured_image || null,
      type,
      showInHeader ? 1 : 0,
      showInFooter ? 1 : 0
    );
    updatePostCategories(result.lastInsertRowid, category_ids);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post.', detail: err.message });
  }
};

// updatePost
exports.updatePost = (req, res) => {
  const id = req.params.id;
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  const {
    title = post.title,
    slug = post.slug,
    content = post.content,
    excerpt = post.excerpt,
    published_at = post.published_at,
    author_id = post.author_id,
    featured_image = post.featured_image,
    category_ids,
    type = post.type,
    showInHeader = post.showInHeader,
    showInFooter = post.showInFooter
  } = req.body;

  try {
    db.prepare(`
      UPDATE posts
      SET title = ?, slug = ?, content = ?, excerpt = ?, published_at = ?,
          author_id = ?, featured_image = ?, type = ?, showInHeader = ?, showInFooter = ?
      WHERE id = ?
    `).run(
      title, slug, content, excerpt, published_at,
      author_id, featured_image, type,
      showInHeader ? 1 : 0, showInFooter ? 1 : 0, id
    );

    updatePostCategories(id, category_ids);
    res.json({ message: 'Post updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post.', detail: err.message });
  }
};

// deletePost
exports.deletePost = (req, res) => {
  try {
    const result = db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Post not found.' });
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post.', detail: err.message });
  }
};

// getPages
exports.getPages = (req, res) => {
  let query = "SELECT * FROM posts WHERE type = 'page'";
  const params = [];

  if (req.query.place === 'header') query += " AND showInHeader = 1";
  else if (req.query.place === 'footer') query += " AND showInFooter = 1";
  query += " ORDER BY datetime(published_at) DESC";

  try {
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve pages.', detail: err.message });
  }
};

// getPageBySlug
exports.getPageBySlug = (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM posts WHERE slug = ? AND type = 'page'").get(req.params.slug);
    if (!row) return res.status(404).json({ error: 'Page not found.' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve page by slug.', detail: err.message });
  }
};

// getAllCategories
exports.getAllCategories = (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT c.id, c.name, c.slug, COUNT(pc.post_id) as post_count
      FROM categories c
      LEFT JOIN post_categories pc ON c.id = pc.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve categories.', detail: err.message });
  }
};

// deleteCategory
exports.deleteCategory = (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare(`
      SELECT COUNT(*) as count
      FROM post_categories pc
      INNER JOIN posts p ON pc.post_id = p.id
      WHERE pc.category_id = ?
    `).get(id);
    if (row.count > 0) return res.status(400).json({ error: 'Cannot delete category: It is associated with existing posts.' });

    const result = db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category.', detail: err.message });
  }
};

// updateCategory
exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'Name and slug are required.' });

  try {
    const result = db.prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?").run(name, slug, id);
    if (result.changes === 0) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: 'Category updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category.', detail: err.message });
  }
};

// addCategory
exports.addCategory = (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'Name and slug are required.' });

  try {
    const result = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)").run(name, slug);
    res.status(201).json({ message: 'Category created successfully.', category: { id: result.lastInsertRowid, name, slug } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add category.', detail: err.message });
  }
};

// updatePostCategories
function updatePostCategories(postId, categoryIds = []) {
  db.prepare("DELETE FROM post_categories WHERE post_id = ?").run(postId);
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return;

  const insert = db.prepare("INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)");
  const insertMany = db.transaction((categories) => {
    for (const catId of categories) {
      insert.run(postId, catId);
    }
  });
  insertMany(categoryIds);
}