const axios = require('axios');
const env = require('../config/env');

console.log('✅ Email service initialized - configured with Brevo API');

const sendOtpEmail = async (toEmail, otpCode, retries = 2) => {
  const brevoUrl = 'https://api.brevo.com/v3/smtp/email';
  const apiKey = env.brevoApiKey;

  if (!apiKey) {
    console.error('❌ BREVO_API_KEY is not defined in the environment variables');
    throw new Error('Email service is not configured (missing API key)');
  }

  const senderEmail = env.smtp.user || env.email.user || 'danangtanggul123@gmail.com';

  const data = {
    sender: {
      name: 'TraceIT - Lost & Found',
      email: senderEmail
    },
    to: [
      {
        email: toEmail
      }
    ],
    subject: 'Kode OTP Reset Password - TraceIT',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2196F3;">TraceIT</h1>
        </div>
        <h2>Permintaan Reset Password</h2>
        <p>Anda meminta untuk mereset password akun Anda. Gunakan kode OTP di bawah ini untuk memverifikasi identitas Anda:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; color: #333;">
          ${otpCode}
        </div>
        <p style="color: #e74c3c;"><strong>Kode ini berlaku selama 15 menit.</strong></p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">Email ini dikirim otomatis oleh sistem TraceIT. Jangan membalas email ini.</p>
      </div>
    `
  };

  const headers = {
    'accept': 'application/json',
    'api-key': apiKey,
    'content-type': 'application/json'
  };

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await axios.post(brevoUrl, data, { headers });
      console.log(`✅ OTP email sent via Brevo to ${toEmail} (attempt ${attempt}):`, response.data);
      return true;
    } catch (error) {
      const errorMsg = error.response && error.response.data 
        ? JSON.stringify(error.response.data) 
        : error.message;
      console.error(`❌ Attempt ${attempt} failed to send email to ${toEmail}:`, errorMsg);
      if (attempt <= retries) {
        console.log(`🔄 Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw new Error(`Failed to send OTP email after multiple attempts: ${errorMsg}`);
      }
    }
  }
};

module.exports = {
  sendOtpEmail,
};
