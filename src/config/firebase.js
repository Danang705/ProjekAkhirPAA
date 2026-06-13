require('dotenv').config();

// firebase-admin v12+ menggunakan named exports, bukan default admin object
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

let initialized = false;

const initializeFirebase = () => {
  if (initialized) return;
  initialized = true;

  try {
    let serviceAccount;

    // Prioritaskan Base64 environment variable (untuk Render production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const decoded = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        'base64'
      ).toString('utf8');
      serviceAccount = JSON.parse(decoded);
      console.log('🔥 Firebase: Loading credentials from Base64 env var');
    } else {
      // Fallback: baca dari file lokal (untuk development)
      try {
        serviceAccount = require('../../firebase-service-account.json');
        console.log('🔥 Firebase: Loading credentials from local file');
      } catch (fileError) {
        console.warn('⚠️  Firebase: firebase-service-account.json not found.');
        console.warn('   → Push notifications will be DISABLED.');
        console.warn('   → Letakkan file di: lost-found-api/firebase-service-account.json');
        console.warn('   → Atau set env var FIREBASE_SERVICE_ACCOUNT_BASE64 di Render.');
        return;
      }
    }

    // Inisialisasi hanya jika belum ada app yang aktif
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
  }
};

/**
 * Dapatkan instance Firebase Messaging.
 * Mengembalikan null jika Firebase belum/gagal diinisialisasi.
 */
const getFirebaseMessaging = () => {
  try {
    if (getApps().length === 0) {
      return null;
    }
    return getMessaging();
  } catch {
    return null;
  }
};

module.exports = { initializeFirebase, getFirebaseMessaging };
