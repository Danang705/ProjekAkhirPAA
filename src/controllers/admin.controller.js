const adminService = require('../services/admin.service');
const { successResponse, errorResponse } = require('../utils/response.util');

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await adminService.getAllUsers(page, limit);
    return successResponse(res, 200, 'Users retrieved successfully', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    if (typeof isBanned !== 'boolean') {
      return errorResponse(res, 400, 'isBanned must be a boolean');
    }

    const updatedUser = await adminService.toggleBanUser(id, isBanned);
    return successResponse(res, 200, `User ban status updated to ${isBanned}`, updatedUser);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await adminService.getAllPosts(page, limit);
    return successResponse(res, 200, 'Posts retrieved successfully', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deletePostAdmin(id);
    return successResponse(res, 200, 'Post deleted successfully by admin');
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await adminService.getStatistics();
    return successResponse(res, 200, 'Statistics retrieved successfully', stats);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  getUsers,
  banUser,
  getPosts,
  deletePost,
  getStats
};
