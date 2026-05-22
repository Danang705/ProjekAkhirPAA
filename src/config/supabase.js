const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

if (!env.supabase.url || !env.supabase.key) {
  throw new Error('Supabase URL and Key must be provided in .env file');
}

// Gunakan serviceRoleKey (jika ada) untuk Backend agar bisa mem-bypass RLS (Row Level Security) Supabase.
// Jika tidak ada, fallback ke anon key.
const supabaseKey = env.supabase.serviceRoleKey || env.supabase.key;

const supabase = createClient(env.supabase.url, supabaseKey);

module.exports = supabase;
