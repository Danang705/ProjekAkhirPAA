const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');

// All admin routes must be authenticated and requires Admin privileges
router.use(authenticate, requireAdmin);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/ban', adminController.banUser);

router.get('/posts', adminController.getPosts);
router.delete('/posts/:id', adminController.deletePost);

router.get('/statistics', adminController.getStats);

module.exports = router;
