const commentService = require('../services/comment.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Menambahkan komentar baru
 */
const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, content } = req.body;

    if (!postId || !content) {
      return errorResponse(res, 400, 'postId and content are required');
    }

    const newComment = await commentService.createComment(userId, postId, content);
    return successResponse(res, 201, 'Comment added successfully', newComment);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Mengambil daftar komentar berdasarkan post_id
 */
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return errorResponse(res, 400, 'postId is required');
    }

    const comments = await commentService.getCommentsByPostId(postId);
    return successResponse(res, 200, 'Comments retrieved successfully', comments);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Menghapus komentar
 */
const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, 400, 'Comment ID is required');
    }

    await commentService.deleteComment(id, userId);
    return successResponse(res, 200, 'Comment deleted successfully');
  } catch (error) {
    let status = 500;
    if (error.message.includes('Unauthorized')) status = 403;
    else if (error.message.includes('not found')) status = 404;
    return errorResponse(res, status, error.message);
  }
};

module.exports = {
  createComment,
  getComments,
  deleteComment,
};
