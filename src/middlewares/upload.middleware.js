const multer = require('multer');

// Gunakan memoryStorage agar file tidak disimpan di hardisk lokal, 
// melainkan di RAM (Buffer) sementara, lalu langsung dilempar ke Supabase.
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Max
});

module.exports = upload;
