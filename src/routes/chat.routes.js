const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/', authenticate, chatController.getChats);
router.get('/:roomId/messages', authenticate, chatController.getMessages);

module.exports = router;
