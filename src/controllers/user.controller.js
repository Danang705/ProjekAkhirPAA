const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/response.util');

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar, phone, address } = req.body;

    const updatedUser = await userService.updateUserProfile(userId, { avatar, phone, address });
    return successResponse(res, 200, 'Profile updated successfully', updatedUser);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserProfile(id);
    return successResponse(res, 200, 'Profile fetched successfully', user);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

module.exports = {
  updateProfile,
  getProfile,
};
