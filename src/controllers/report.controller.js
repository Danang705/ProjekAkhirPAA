const reportService = require('../services/report.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Membuat laporan baru untuk postingan tertentu
 */
const createReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, reason, description } = req.body;

    if (!postId || !reason) {
      return errorResponse(res, 400, 'postId and reason are required');
    }

    const newReport = await reportService.createReport(userId, postId, reason, description);
    return successResponse(res, 201, 'Report submitted successfully', newReport);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Mengambil daftar seluruh laporan masuk (Admin Only)
 */
const getReports = async (req, res) => {
  try {
    const reports = await reportService.getReports();
    return successResponse(res, 200, 'Reports retrieved successfully', reports);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Mengubah status laporan (Admin Only)
 */
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return errorResponse(res, 400, 'Report ID and status are required');
    }

    const validStatuses = ['pending', 'reviewed', 'resolved'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, 'Invalid status value. Allowed: pending, reviewed, resolved');
    }

    const updatedReport = await reportService.updateReportStatus(id, status);
    return successResponse(res, 200, 'Report status updated successfully', updatedReport);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
};
