const supabase = require('../config/supabase');

const createResponse = async (postId, userId, data) => {
  const { message, proofImage } = data;

  // Verify the post exists and user is not the owner (cannot claim own post)
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (postError || !post) throw new Error('Post not found');
  if (post.user_id === userId) throw new Error('You cannot respond to your own post');

  // Insert response
  const { data: newResponse, error: responseError } = await supabase
    .from('responses')
    .insert([{ post_id: postId, user_id: userId, message, proof_image_url: proofImage }])
    .select('*')
    .single();

  if (responseError) throw new Error(responseError.message);
  return newResponse;
};

const getResponsesByPost = async (postId, userId) => {
  // Only the post owner should ideally see all responses, but let's check
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (postError || !post) throw new Error('Post not found');
  if (post.user_id !== userId) throw new Error('Unauthorized to view responses for this post');

  const { data: responses, error } = await supabase
    .from('responses')
    .select('*, users(name, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return responses;
};

const updateResponseStatus = async (responseId, userId, status) => {
  // 1. Fetch response and related post to verify ownership
  const { data: responseData, error: respError } = await supabase
    .from('responses')
    .select('*, posts(user_id)')
    .eq('id', responseId)
    .single();

  if (respError || !responseData) throw new Error('Response not found');
  if (responseData.posts.user_id !== userId) throw new Error('Unauthorized to update this response');
  if (responseData.status === 'accepted') throw new Error('Response is already accepted');

  // 2. Update response status
  const { data: updatedResponse, error: updateError } = await supabase
    .from('responses')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', responseId)
    .select('*')
    .single();

  if (updateError) throw new Error(updateError.message);

  // 3. If accepted, auto-create a chat room
  let chatRoom = null;
  if (status === 'accepted') {
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert([{
        post_id: responseData.post_id,
        response_id: responseId,
        user1_id: userId, // post owner
        user2_id: responseData.user_id // claimer
      }])
      .select('*')
      .single();

    if (chatError) {
      // In a real robust system, we might rollback the status update here if chat creation fails
      console.error('Failed to create chat room:', chatError);
    } else {
      chatRoom = chat;
    }
  }

  return { response: updatedResponse, chatRoom };
};

module.exports = {
  createResponse,
  getResponsesByPost,
  updateResponseStatus
};
