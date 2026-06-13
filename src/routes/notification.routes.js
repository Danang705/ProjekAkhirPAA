const express = require('express');
const router = express.Router();
const { registerToken, unregisterToken } = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// POST /api/notifications/register-token
// Daftarkan/perbarui FCM token untuk user yang sedang login
router.post('/register-token', authenticate, registerToken);

// DELETE /api/notifications/unregister-token
// Hapus FCM token saat user logout
router.delete('/unregister-token', authenticate, unregisterToken);

module.exports = router;
