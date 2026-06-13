const supabase = require('../config/supabase');

/**
 * Membuat komentar baru di postingan
 */
const createComment = async (userId, postId, content) => {
  const { data: newComment, error } = await supabase
    .from('comments')
    .insert([
      { user_id: userId, post_id: postId, content }
    ])
    .select('*, users(name, avatar_url)')
    .single();

  if (error) throw new Error(error.message);
  return newComment;
};

/**
 * Mengambil daftar komentar untuk postingan tertentu
 */
const getCommentsByPostId = async (postId) => {
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*, users(name, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return comments;
};

/**
 * Menghapus komentar jika user adalah pemilik komentar atau pemilik postingan
 */
const deleteComment = async (commentId, userId) => {
  // Ambil komentar untuk dicek kepemilikannya
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('id, user_id, post_id, posts(user_id)')
    .eq('id', commentId)
    .single();

  if (fetchError || !comment) throw new Error('Comment not found');

  const isCommentOwner = comment.user_id === userId;
  const isPostOwner = comment.posts && comment.posts.user_id === userId;

  if (!isCommentOwner && !isPostOwner) {
    throw new Error('Unauthorized to delete this comment');
  }

  const { error: deleteError } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (deleteError) throw new Error(deleteError.message);
  return true;
};

module.exports = {
  createComment,
  getCommentsByPostId,
  deleteComment,
};
