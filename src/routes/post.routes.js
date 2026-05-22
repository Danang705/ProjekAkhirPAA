const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Public or Semi-public read endpoints (Can be accessed without auth if desired, but applying auth based on requirements)
router.get('/', postController.getPosts);
router.get('/maps', postController.getMapPosts);
router.get('/:id', postController.getPostById);

// Protected write endpoints
router.post('/', authenticate, postController.createPost);
router.put('/:id', authenticate, postController.updatePost);
router.patch('/:id/status', authenticate, postController.updatePostStatus);
router.delete('/:id', authenticate, postController.deletePost);

module.exports = router;
