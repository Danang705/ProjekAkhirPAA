const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Routes for comments
router.post('/', authenticate, commentController.createComment);
router.get('/post/:postId', commentController.getComments);
router.delete('/:id', authenticate, commentController.deleteComment);

module.exports = router;
