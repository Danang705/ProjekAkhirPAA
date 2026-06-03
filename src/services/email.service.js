const https = require('https');
const env = require('../config/env');

// Brevo (Sendinblue) HTTP API - works on any cloud platform
// No SMTP needed, uses HTTPS (port 443) which is never blocked
const sendOtpEmail = async (toEmail, otpCode) => {
  const apiKey = env.brevoApiKey;
  const senderEmail = env.email.user;

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const htmlContent = `
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
  `;

  const postData = JSON.stringify({
    sender: { name: 'TraceIT', email: senderEmail },
    to: [{ email: toEmail }],
    subject: 'Kode OTP Reset Password - TraceIT',
    htmlContent: htmlContent,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ OTP email sent to ${toEmail} via Brevo`);
          resolve(true);
        } else {
          console.error(`❌ Brevo API error (${res.statusCode}):`, data);
          reject(new Error('Failed to send OTP email'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Brevo request error:', error.message);
      reject(new Error('Failed to send OTP email'));
    });

    req.write(postData);
    req.end();
  });
};

module.exports = {
  sendOtpEmail,
};
