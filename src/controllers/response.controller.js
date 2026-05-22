const responseService = require('../services/response.service');
const { successResponse, errorResponse } = require('../utils/response.util');

const createResponse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { message, proofImage } = req.body;

    if (!message) {
      return errorResponse(res, 400, 'Message is required');
    }

    const responseData = await responseService.createResponse(postId, userId, { message, proofImage });
    return successResponse(res, 201, 'Response submitted successfully', responseData);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const getResponses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const responses = await responseService.getResponsesByPost(postId, userId);
    return successResponse(res, 200, 'Responses retrieved successfully', responses);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const updateStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return errorResponse(res, 400, 'Invalid status. Must be accepted or rejected');
    }

    const result = await responseService.updateResponseStatus(id, userId, status);
    return successResponse(res, 200, `Response ${status} successfully`, result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  createResponse,
  getResponses,
  updateStatus
};
