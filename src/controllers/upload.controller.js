const { uploadToSupabase } = require('../services/upload.service');
const { successResponse, errorResponse } = require('../utils/response.util');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Tidak ada file yang diunggah');
    }
    
    // Default folder is 'misc', but can be overridden via form data (e.g., folder: 'avatars')
    const folderName = req.body.folder || 'misc';

    // Upload file buffer directly to Supabase Storage
    const fileUrl = await uploadToSupabase(
      req.file.buffer, 
      req.file.originalname, 
      req.file.mimetype, 
      folderName
    );

    return successResponse(res, 200, 'File berhasil diunggah', { url: fileUrl });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  uploadFile
};
