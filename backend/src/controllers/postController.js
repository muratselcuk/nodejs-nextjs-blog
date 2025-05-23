
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const slugify = require('../utils/slugify');
const dbPath = path.join(__dirname, '../../../blog.sqlite');
const db = new sqlite3.Database(dbPath);

// Show all posts*
exports.getAllPosts = (req, res) => {
  const query = `
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
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve posts.' });
    const result = rows.map(row => {
  const { author_id, author_name, author_username, categories, ...rest } = row;
  const categoryList = categories
    ? categories.split('||').map(item => {
        const [name, slug] = item.split(':');
        return { name, slug };
      })
    : [];
  return {
    ...rest,
    categories: categoryList,
    author: {
      id: author_id,
      name: author_name,
      username: author_username
    }
  };
});
res.json(result);

  });
};

// Show Category Posts*
exports.getPostsByCategory = (req, res) => {
  const slug = req.params.slug;
  const query = `
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
  `;

  db.all(query, [slug], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve posts by category.' });

    const result = rows.map(row => {
      const { author_id, author_name, author_username, categories, ...rest } = row;
      const categoryList = categories
        ? categories.split('||').map(item => {
            const [name, slug] = item.split(':');
            return { name, slug };
          })
        : [];
      return {
        ...rest,
        categories: categoryList,
        author: {
          id: author_id,
          name: author_name,
          username: author_username
        }
      };
    });

    res.json(result);
  });
};


// Show a single post*
exports.getPostById = (req, res) => {
  const query = `
    SELECT p.*, 
           a.id AS author_id, a.name AS author_name, a.username AS author_username,
           GROUP_CONCAT(c.name || ':' || c.slug, '||') AS categories
    FROM posts p
    JOIN authors a ON p.author_id = a.id
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE p.id = ? AND p.type = 'post'
    GROUP BY p.id
  `;
  db.get(query, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve post.' });
    if (!row) return res.status(404).json({ error: 'Post not found.' });

    row.categories = row.categories
      ? row.categories.split('||').map(item => {
          const [name, slug] = item.split(':');
          return { name, slug };
        })
      : [];

    row.author = {
      id: row.author_id,
      name: row.author_name,
      username: row.author_username
    };
    delete row.author_id;
    delete row.author_name;
    delete row.author_username;

    res.json(row);
  });
};

//Single Post slug*
exports.getPostBySlug = (req, res) => {
  const slug = req.params.slug;
  const query = `
    SELECT p.*, 
           a.id AS author_id, a.name AS author_name, a.username AS author_username,
           GROUP_CONCAT(c.name || ':' || c.slug, '||') AS categories
    FROM posts p
    JOIN authors a ON p.author_id = a.id
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE p.slug = ?
    GROUP BY p.id
  `;
  db.get(query, [slug], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve post.' });
    if (!row) return res.status(404).json({ error: 'Post not found.' });

    row.categories = row.categories
      ? row.categories.split('||').map(item => {
          const [name, slug] = item.split(':');
          return { name, slug };
        })
      : [];

    row.author = {
      id: row.author_id,
      name: row.author_name,
      username: row.author_username
    };
    delete row.author_id;
    delete row.author_name;
    delete row.author_username;

    res.json(row);
  });
};


// Create a new post*
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
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
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
  ];

  db.run(query, params, async function (err) {
    if (err) return res.status(500).json({ error: 'Failed to create post.' });
    try {
      await updatePostCategories(this.lastID, category_ids);
      res.status(201).json({ id: this.lastID });
    } catch (catErr) {
      res.status(500).json({ error: 'Post created but category mapping failed.' });
    }
  });
};


// Update a post*
exports.updatePost = (req, res) => {
  const id = req.params.id;
  const {
    title, slug, content, excerpt,
    published_at, author_id, featured_image,
    category_ids, type,
    showInHeader,
    showInFooter
  } = req.body;

  const selectQuery = "SELECT * FROM posts WHERE id = ?";
  db.get(selectQuery, [id], (err, existing) => {
    if (err || !existing) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const updated = {
      title: title ?? existing.title,
      slug: slug ?? existing.slug,
      content: content ?? existing.content,
      excerpt: excerpt ?? existing.excerpt,
      published_at: published_at ?? existing.published_at,
      author_id: author_id ?? existing.author_id,
      featured_image: featured_image ?? existing.featured_image,
      type: type ?? existing.type,
      showInHeader: typeof showInHeader === 'boolean' ? (showInHeader ? 1 : 0) : existing.showInHeader,
      showInFooter: typeof showInFooter === 'boolean' ? (showInFooter ? 1 : 0) : existing.showInFooter
    };

    const updateQuery = `
      UPDATE posts
      SET title = ?, slug = ?, content = ?, excerpt = ?, published_at = ?,
          author_id = ?, featured_image = ?, type = ?, showInHeader = ?, showInFooter = ?
      WHERE id = ?
    `;
    const params = [
      updated.title, updated.slug, updated.content, updated.excerpt, updated.published_at,
      updated.author_id, updated.featured_image, updated.type, updated.showInHeader, updated.showInFooter, id
    ];

    db.run(updateQuery, params, async function (err) {
      if (err) return res.status(500).json({ error: 'Failed to update post.' });
      try {
        await updatePostCategories(id, category_ids);
        res.json({ message: 'Post updated successfully.' });
      } catch (catErr) {
        res.status(500).json({ error: 'Post updated but category update failed.' });
      }
    });
  });
};


// Delete a post
exports.deletePost = (req, res) => {
  const query = "DELETE FROM posts WHERE id = ?";
  db.run(query, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete post.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.json({ message: 'Post deleted successfully.' });
  });
};

//List Pages*
exports.getPages = (req, res) => {
  let query = "SELECT * FROM posts WHERE type = 'page'";
  const params = [];

  if (req.query.place === 'header') {
    query += " AND showInHeader = 1";
  } else if (req.query.place === 'footer') {
    query += " AND showInFooter = 1";
  }

  query += " ORDER BY datetime(published_at) DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("SQLite error in getPages:", err);
      return res.status(500).json({ error: 'Failed to retrieve pages.', detail: err.message });
    }
    res.json(rows);
  });
};


// Show page slug
exports.getPageBySlug = (req, res) => {
  const slug = req.params.slug;
  const query = "SELECT * FROM posts WHERE slug = ? AND type = 'page'";
  db.get(query, [slug], (err, row) => {
    if (err) {
      console.error("SQLite error in getPageBySlug:", err);
      return res.status(500).json({ error: 'Failed to retrieve page by slug.', detail: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Page not found.' });
    }
    res.json(row);
  });
};


// List all Categories
exports.getAllCategories = (req, res) => {
  const query = `
    SELECT c.id, c.name, c.slug, COUNT(pc.post_id) as post_count
    FROM categories c
    LEFT JOIN post_categories pc ON c.id = pc.category_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("SQLite error in getAllCategories:", err);
      return res.status(500).json({ error: 'Failed to retrieve categories.', detail: err.message });
    }
    res.json(rows);
  });
};

// Delete a category (only if no posts are linked)
exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  const checkQuery = `
    SELECT COUNT(*) as count
    FROM post_categories pc
    INNER JOIN posts p ON pc.post_id = p.id
    WHERE pc.category_id = ?
  `;

  db.get(checkQuery, [id], (err, row) => {
    if (err) {
      console.error("SQLite error in deleteCategory (check):", err);
      return res.status(500).json({ error: 'Failed to check category usage.', detail: err.message });
    }

    if (row.count > 0) {
      return res.status(400).json({ error: 'Cannot delete category: It is associated with existing posts.' });
    }

    const deleteQuery = `DELETE FROM categories WHERE id = ?`;

    db.run(deleteQuery, [id], function (err) {
      if (err) {
        console.error("SQLite error in deleteCategory:", err);
        return res.status(500).json({ error: 'Failed to delete category.', detail: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found.' });
      }

      res.json({ message: 'Category deleted successfully.' });
    });
  });
};


//update category
exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required.' });
  }

  const query = `UPDATE categories SET name = ?, slug = ? WHERE id = ?`;

  db.run(query, [name, slug, id], function (err) {
    if (err) {
      console.error("SQLite error in updateCategory:", err);
      return res.status(500).json({ error: 'Failed to update category.', detail: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    res.json({ message: 'Category updated successfully.' });
  });
};


//add category
exports.addCategory = (req, res) => {
  const { name, slug } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required.' });
  }

  const query = `INSERT INTO categories (name, slug) VALUES (?, ?)`;

  db.run(query, [name, slug], function (err) {
    if (err) {
      console.error("SQLite error in addCategory:", err);
      return res.status(500).json({ error: 'Failed to add category.', detail: err.message });
    }
    res.status(201).json({
      message: 'Category created successfully.',
      category: { id: this.lastID, name, slug }
    });
  });
};

//category_ide - post_categories connection
function updatePostCategories(postId, categoryIds = []) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM post_categories WHERE post_id = ?", [postId], (err) => {
      if (err) return reject(err);

      if (!Array.isArray(categoryIds) || categoryIds.length === 0) return resolve();

      const placeholders = categoryIds.map(() => "(?, ?)").join(", ");
      const values = categoryIds.flatMap(catId => [postId, catId]);

      const insertQuery = `INSERT INTO post_categories (post_id, category_id) VALUES ${placeholders}`;
      db.run(insertQuery, values, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}
