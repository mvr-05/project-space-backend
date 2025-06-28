// File: routes/postRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createPost,
  likePost,
  viewPost,
  getAllPosts,
  getAllPostsOfUser
} = require('../controllers/postController');
// Get all posts (with optional filters)
router.get('/', getAllPosts);

// Get all posts of a user
router.get('/user/posts', auth, getAllPostsOfUser); // ✅ safer

// Create post
router.post('/', auth, createPost);

// Like post
router.patch('/:id/like', likePost);

// View post
router.patch('/:id/view', viewPost);

module.exports = router;
