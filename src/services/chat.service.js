const supabase = require('../config/supabase');

const getChatsList = async (userId) => {
  // Fetch chats where the user is either user1 (owner) or user2 (claimer)
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id, created_at,
      post:posts(id, title, images),
      user1:user1_id(id, name, avatar_url),
      user2:user2_id(id, name, avatar_url)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const getChatMessages = async (chatId, userId, page = 1, limit = 20) => {
  // 1. Verify user is part of the chat
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('user1_id, user2_id')
    .eq('id', chatId)
    .single();

  if (chatError || !chat) throw new Error('Chat room not found');
  if (chat.user1_id !== userId && chat.user2_id !== userId) {
    throw new Error('Unauthorized to view messages in this chat');
  }

  // 2. Fetch messages with pagination
  const offset = (page - 1) * limit;
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (msgError) throw new Error(msgError.message);
  return messages;
};

const saveMessage = async (chatId, senderId, content, type = 'text') => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ chat_id: chatId, sender_id: senderId, content, type }])
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
};

module.exports = {
  getChatsList,
  getChatMessages,
  saveMessage
};
