const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');

// Routes for reports
router.post('/', authenticate, reportController.createReport);
router.get('/', authenticate, requireAdmin, reportController.getReports);
router.patch('/:id/status', authenticate, requireAdmin, reportController.updateReportStatus);

module.exports = router;
