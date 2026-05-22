const express = require('express');
const router = express.Router();
const responseController = require('../controllers/response.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Root path here will be mapped to '/api' in app.js
// so that we can support both /posts/:postId/responses and /responses/:id

// Create a response for a post
router.post('/posts/:postId/responses', authenticate, responseController.createResponse);

// Get responses for a specific post (only owner)
router.get('/posts/:postId/responses', authenticate, responseController.getResponses);

// Update status of a response (accept/reject)
router.patch('/responses/:id/status', authenticate, responseController.updateStatus);

module.exports = router;
