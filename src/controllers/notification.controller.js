const supabase = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * POST /api/notifications/register-token
 * Dipanggil oleh Flutter setiap kali app dibuka setelah login,
 * untuk mendaftarkan atau memperbarui FCM token device user.
 */
const registerToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, deviceType = 'android' } = req.body;

    if (!token) {
      return errorResponse(res, 400, 'FCM token is required');
    }

    // Upsert: jika kombinasi user_id+token sudah ada → update updated_at
    // Jika belum ada → insert baru
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          device_type: deviceType,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,token' }
      );

    if (error) throw new Error(error.message);

    console.log(`[FCM] Token registered for user: ${userId}`);
    return successResponse(res, 200, 'FCM token registered successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * DELETE /api/notifications/unregister-token
 * Dipanggil oleh Flutter saat user logout,
 * untuk menghapus FCM token dari database agar notifikasi tidak terkirim ke device lama.
 */
const unregisterToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, 400, 'FCM token is required');
    }

    const { error } = await supabase
      .from('fcm_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token', token);

    if (error) throw new Error(error.message);

    console.log(`[FCM] Token unregistered for user: ${userId}`);
    return successResponse(res, 200, 'FCM token unregistered successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { registerToken, unregisterToken };
