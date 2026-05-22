const supabase = require('../config/supabase');

const getAllUsers = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from('users')
    .select('id, name, email, phone, is_banned, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return { users: data, total: count };
};

const toggleBanUser = async (userId, isBanned) => {
  const { data, error } = await supabase
    .from('users')
    .update({ is_banned: isBanned, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, name, email, is_banned')
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const getAllPosts = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from('posts')
    .select('*, users(name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return { posts: data, total: count };
};

const deletePostAdmin = async (postId) => {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw new Error(error.message);
  return true;
};

const getStatistics = async () => {
  // We can run multiple counts in parallel
  const [usersCount, postsCount, claimsCount, resolvedPostsCount] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('responses').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'closed')
  ]);

  return {
    totalUsers: usersCount.count || 0,
    totalPosts: postsCount.count || 0,
    totalClaims: claimsCount.count || 0,
    totalResolved: resolvedPostsCount.count || 0
  };
};

module.exports = {
  getAllUsers,
  toggleBanUser,
  getAllPosts,
  deletePostAdmin,
  getStatistics
};
