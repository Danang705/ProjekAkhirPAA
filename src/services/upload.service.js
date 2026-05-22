const supabase = require('../config/supabase');

/**
 * Helper function to upload file buffer to Supabase Storage
 * @param {Buffer} fileBuffer - The memory buffer of the file
 * @param {String} fileName - The original file name
 * @param {String} mimetype - The file mime type (e.g. image/jpeg)
 * @param {String} folder - The sub-folder name in the bucket (e.g., 'chats', 'avatars', 'posts')
 * @returns {Promise<String>} - The public URL of the uploaded file
 */
const uploadToSupabase = async (fileBuffer, fileName, mimetype, folder = 'misc') => {
  // Create a unique file path to prevent overwriting
  const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  // Clean filename from spaces
  const cleanFileName = fileName.replace(/\s+/g, '-');
  const filePath = `${folder}/${uniquePrefix}-${cleanFileName}`;
  
  const { data, error } = await supabase
    .storage
    .from('uploads')
    .upload(filePath, fileBuffer, {
      contentType: mimetype,
      upsert: false // Set true if you want to overwrite
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  // Generate and return the public URL
  const { data: publicUrlData } = supabase
    .storage
    .from('uploads')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

module.exports = { 
  uploadToSupabase 
};
