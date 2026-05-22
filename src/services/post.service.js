const supabase = require('../config/supabase');

/* 
 * IMPORTANT NOTE FOR GIS SEARCH:
 * Supabase PostgREST might have complex syntax for spatial queries.
 * A very common and clean approach is to create a Postgres RPC function in your Supabase SQL Editor.
 * 
 * EXECUTE THIS IN SUPABASE SQL EDITOR TO SUPPORT RADIUS SEARCH:
 * 
 * CREATE OR REPLACE FUNCTION search_posts_in_radius(
 *   p_lat double precision,
 *   p_lng double precision,
 *   p_radius_meters double precision,
 *   p_type text DEFAULT NULL,
 *   p_category text DEFAULT NULL,
 *   p_search text DEFAULT NULL
 * ) RETURNS SETOF posts AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT *
 *   FROM posts
 *   WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326), p_radius_meters)
 *   AND (p_type IS NULL OR type = p_type::post_type)
 *   AND (p_category IS NULL OR category = p_category)
 *   AND (p_search IS NULL OR title ILIKE '%' || p_search || '%' OR description ILIKE '%' || p_search || '%');
 * END;
 * $$ LANGUAGE plpgsql;
 */

const createPost = async (userId, data) => {
  const { type, title, description, category, date, lat, lng, images } = data;
  
  // Insert with location geometry using PostGIS ST_Point
  // In Supabase js, we can often just insert the EWKT string: 'SRID=4326;POINT(lng lat)'
  const locationPoint = `SRID=4326;POINT(${lng} ${lat})`;

  const { data: newPost, error } = await supabase
    .from('posts')
    .insert([
      { 
        user_id: userId, type, title, description, category, event_date: date, lat, lng, images, location: locationPoint 
      }
    ])
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return newPost;
};

const getPosts = async (filters) => {
  const { type, lat, lng, radius, search, category } = filters;

  // If lat, lng, and radius are provided, we use the RPC function we defined above
  if (lat && lng && radius) {
    const { data: posts, error } = await supabase.rpc('search_posts_in_radius', {
      p_lat: parseFloat(lat),
      p_lng: parseFloat(lng),
      p_radius_meters: parseFloat(radius),
      p_type: type || null,
      p_category: category || null,
      p_search: search || null
    });
    
    if (error) throw new Error(error.message);
    return posts;
  }

  // Fallback to standard query if no radius is provided
  let query = supabase.from('posts').select('*, users(name, avatar_url)');

  if (type) query = query.eq('type', type);
  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data: posts, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return posts;
};

const getMapPosts = async (lat, lng, radius) => {
  // Lightweight version for maps (fewer fields)
  if (!lat || !lng || !radius) throw new Error('Latitude, longitude, and radius are required');

  const { data: posts, error } = await supabase.rpc('search_posts_in_radius', {
    p_lat: parseFloat(lat),
    p_lng: parseFloat(lng),
    p_radius_meters: parseFloat(radius)
  });

  if (error) throw new Error(error.message);

  // Return only necessary fields for maps
  return posts.map(post => ({
    id: post.id,
    type: post.type,
    title: post.title,
    lat: post.lat,
    lng: post.lng,
    status: post.status
  }));
};

const getPostById = async (id) => {
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, users(id, name, avatar_url, phone)')
    .eq('id', id)
    .single();

  if (error || !post) throw new Error('Post not found');
  return post;
};

const updatePost = async (id, userId, data) => {
  // Check ownership
  const post = await getPostById(id);
  if (post.user_id !== userId) throw new Error('Unauthorized to update this post');

  const updates = { ...data, updated_at: new Date().toISOString() };
  if (data.lat && data.lng) {
    updates.location = `SRID=4326;POINT(${data.lng} ${data.lat})`;
  }

  const { data: updatedPost, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return updatedPost;
};

const deletePost = async (id, userId) => {
  const post = await getPostById(id);
  if (post.user_id !== userId) throw new Error('Unauthorized to delete this post');

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
};

const updatePostStatus = async (id, userId, status) => {
  const post = await getPostById(id);
  if (post.user_id !== userId) throw new Error('Unauthorized to update status');

  const { data, error } = await supabase
    .from('posts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
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
