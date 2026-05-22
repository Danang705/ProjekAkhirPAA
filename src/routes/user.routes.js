const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// User routes
router.put('/profile', authenticate, userController.updateProfile);
router.get('/:id', authenticate, userController.getProfile);

module.exports = router;
