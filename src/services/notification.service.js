const { getFirebaseMessaging } = require('../config/firebase');
const supabase = require('../config/supabase');

/**
 * Ambil semua FCM token milik seorang user dari database
 * @param {string} userId - UUID user
 * @returns {Promise<string[]>} - Array of FCM token strings
 */
const getUserFcmTokens = async (userId) => {
  const { data, error } = await supabase
    .from('fcm_tokens')
    .select('token')
    .eq('user_id', userId);

  if (error || !data || data.length === 0) return [];
  return data.map((row) => row.token);
};

/**
 * Kirim push notification ke satu user (bisa punya banyak device)
 * @param {string} userId - UUID penerima notifikasi
 * @param {{ title: string, body: string }} notification - Judul dan isi notifikasi
 * @param {object} data - Data tambahan yang dikirim ke Flutter (opsional)
 */
const sendNotificationToUser = async (userId, notification, data = {}) => {
  const messaging = getFirebaseMessaging();

  // Jika Firebase belum diinisialisasi, skip tanpa error
  if (!messaging) {
    console.warn('[FCM] Firebase not initialized. Skipping notification.');
    return;
  }

  try {
    const tokens = await getUserFcmTokens(userId);

    if (tokens.length === 0) {
      console.log(`[FCM] User ${userId} has no registered FCM tokens. Skipping.`);
      return;
    }

    // FCM mensyaratkan semua value di 'data' berupa string
    const stringData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    );

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: stringData,
      android: {
        notification: {
          sound: 'default',
          channelId: 'traceit_notifications', // harus sama dengan channel di Flutter
          priority: 'high',
        },
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      tokens: tokens, // kirim ke semua device user sekaligus (multicast)
    };

    const response = await messaging.sendEachForMulticast(message);

    console.log(
      `[FCM] Sent to user ${userId}: ${response.successCount} success, ${response.failureCount} failed`
    );

    // Bersihkan token yang sudah tidak valid dari database
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (
          !resp.success &&
          (resp.error?.code === 'messaging/invalid-registration-token' ||
            resp.error?.code === 'messaging/registration-token-not-registered')
        ) {
          invalidTokens.push(tokens[idx]);
          console.log(`[FCM] Invalid token detected: ${tokens[idx].substring(0, 20)}...`);
        }
      });

      if (invalidTokens.length > 0) {
        await supabase.from('fcm_tokens').delete().in('token', invalidTokens);
        console.log(`[FCM] Cleaned up ${invalidTokens.length} invalid token(s) from DB`);
      }
    }

    return response;
  } catch (error) {
    // Error di sini TIDAK boleh menghentikan flow utama API
    console.error('[FCM] Error sending notification:', error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// NOTIFIKASI SPESIFIK SESUAI FITUR TRACEIT
// ─────────────────────────────────────────────────────────────

/**
 * [NOTIF 1] Beritahu pemilik post bahwa ada user lain yang merespons/mengklaim post mereka
 * @param {string} postOwnerId - UUID pemilik post
 * @param {string} responderName - Nama user yang mengklaim
 * @param {string} postTitle - Judul post
 */
const notifyPostOwnerNewResponse = async (postOwnerId, responderName, postTitle) => {
  await sendNotificationToUser(
    postOwnerId,
    {
      title: '📩 Ada Klaim Baru!',
      body: `${responderName} mengklaim "${postTitle}"`,
    },
    {
      type: 'new_response',
      screen: 'responses',
    }
  );
};

/**
 * [NOTIF 2] Beritahu claimer bahwa status klaimnya sudah diupdate (accepted/rejected)
 * @param {string} claimerId - UUID user yang mengklaim
 * @param {string} postTitle - Judul post
 * @param {string} status - 'accepted' atau 'rejected'
 * @param {string} chatId - ID chat room jika diterima (opsional)
 */
const notifyResponseStatusUpdate = async (claimerId, postTitle, status, chatId = '') => {
  const isAccepted = status === 'accepted';

  await sendNotificationToUser(
    claimerId,
    {
      title: isAccepted ? '✅ Klaim Diterima!' : '❌ Klaim Ditolak',
      body: isAccepted
        ? `Klaim Anda untuk "${postTitle}" diterima. Chat room sudah dibuka!`
        : `Klaim Anda untuk "${postTitle}" tidak diterima.`,
    },
    {
      type: 'response_status',
      status: status,
      chatId: chatId,
      screen: isAccepted ? 'chat' : 'home',
    }
  );
};

/**
 * [NOTIF 3] Beritahu lawan bicara bahwa ada pesan chat baru
 * @param {string} recipientId - UUID penerima pesan
 * @param {string} senderName - Nama pengirim pesan
 * @param {string} messageContent - Isi pesan
 * @param {string} chatId - ID chat room
 * @param {string} messageType - Tipe pesan: 'text', 'image', 'location'
 */
const notifyNewChatMessage = async (recipientId, senderName, messageContent, chatId, messageType = 'text') => {
  let bodyText;

  if (messageType === 'image') {
    bodyText = '📷 Mengirim gambar';
  } else if (messageType === 'location') {
    bodyText = '📍 Mengirim lokasi';
  } else {
    // Potong pesan teks yang terlalu panjang
    bodyText =
      messageContent.length > 60
        ? `${messageContent.substring(0, 60)}...`
        : messageContent;
  }

  await sendNotificationToUser(
    recipientId,
    {
      title: `💬 ${senderName}`,
      body: bodyText,
    },
    {
      type: 'new_message',
      chatId: chatId,
      screen: 'chat',
    }
  );
};

module.exports = {
  sendNotificationToUser,
  notifyPostOwnerNewResponse,
  notifyResponseStatusUpdate,
  notifyNewChatMessage,
};
