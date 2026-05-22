const chatService = require('../services/chat.service');
const { uploadToSupabase } = require('../services/upload.service');
const { successResponse, errorResponse } = require('../utils/response.util');

const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await chatService.getChatsList(userId);
    return successResponse(res, 200, 'Chat list retrieved successfully', chats);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const messages = await chatService.getChatMessages(roomId, userId, page, limit);
    return successResponse(res, 200, 'Messages retrieved successfully', messages);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  getChats,
  getMessages
};
