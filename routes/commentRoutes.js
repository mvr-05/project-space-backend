const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addComment, getCommentsForPost } = require('../controllers/commentController');

// Create comment
router.post('/:postId', auth, addComment);

// Get comments for a post
router.get('/:postId', getCommentsForPost);

module.exports = router;
