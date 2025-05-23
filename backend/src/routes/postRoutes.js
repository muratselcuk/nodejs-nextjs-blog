const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  deletePost,
  updatePost,
  getPageBySlug,
  //updatePageBySlug,
  getPostBySlug,
  getPostsByCategory,
  getAllCategories,
  getPages,
  addCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/postController');
const { postValidationRules, updatePostValidationRules } = require('../validators/postValidator');
const handleValidation = require('../validators/handleValidation');


// Routes
router.get('/posts', getAllPosts);
router.get('/post/:id', getPostById);
router.post('/posts', postValidationRules, handleValidation, createPost);
router.delete('/post/:id', deletePost);
router.put('/post/:id', updatePostValidationRules, handleValidation, updatePost);
router.get('/page/:slug', getPageBySlug);
//router.put('/page/:slug', updatePostValidationRules, handleValidation, updatePageBySlug);
router.get('/post/slug/:slug', getPostBySlug);
router.get('/category/:slug', getPostsByCategory);
router.get('/categories', getAllCategories);
router.get('/pages', getPages);
router.post('/categories', addCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);




module.exports = router;
