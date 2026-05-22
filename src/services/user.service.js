const supabase = require('../config/supabase');

const updateUserProfile = async (userId, data) => {
  const { avatar, phone, address } = data;
  
  const updates = {
    updated_at: new Date().toISOString(),
  };

  if (avatar !== undefined) updates.avatar_url = avatar;
  if (phone !== undefined) updates.phone = phone;
  if (address !== undefined) updates.address = address;

  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('id, name, email, phone, avatar_url, address, is_banned, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updatedUser;
};

const getUserProfile = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, avatar_url, address, created_at') // omit email/phone for public profiles if preferred, but for now we'll fetch public info
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  return user;
};

module.exports = {
  updateUserProfile,
  getUserProfile,
};
