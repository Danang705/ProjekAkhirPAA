const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Endpoint global untuk upload file
router.post('/', authenticate, upload.single('file'), uploadController.uploadFile);

module.exports = router;
