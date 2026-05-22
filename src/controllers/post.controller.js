const postService = require('../services/post.service');
const { successResponse, errorResponse } = require('../utils/response.util');

const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postData = req.body;
    
    if (!postData.type || !postData.title || !postData.lat || !postData.lng) {
      return errorResponse(res, 400, 'Missing required fields (type, title, lat, lng)');
    }

    const newPost = await postService.createPost(userId, postData);
    return successResponse(res, 201, 'Post created successfully', newPost);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const getPosts = async (req, res) => {
  try {
    const filters = req.query; // { type, lat, lng, radius, search, category }
    const posts = await postService.getPosts(filters);
    return successResponse(res, 200, 'Posts retrieved successfully', posts);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const getMapPosts = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const posts = await postService.getMapPosts(lat, lng, radius);
    return successResponse(res, 200, 'Map posts retrieved successfully', posts);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);
    return successResponse(res, 200, 'Post retrieved successfully', post);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

const updatePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const updatedPost = await postService.updatePost(id, userId, updates);
    return successResponse(res, 200, 'Post updated successfully', updatedPost);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await postService.deletePost(id, userId);
    return successResponse(res, 200, 'Post deleted successfully');
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const updatePostStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return errorResponse(res, 400, 'Status is required');

    const updatedPost = await postService.updatePostStatus(id, userId, status);
    return successResponse(res, 200, 'Post status updated successfully', updatedPost);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  createPost,
  getPosts,
  getMapPosts,
  getPostById,
  updatePost,
  deletePost,
  updatePostStatus
};
