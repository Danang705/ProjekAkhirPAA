const nodemailer = require('nodemailer');
const env = require('../config/env');

// Create SMTP Transporter using configured env credentials
const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465, // True for port 465 SSL, false for others (like 587 STARTTLS)
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

// Verify connection on startup
transporter.verify()
  .then(() => console.log(`✅ Email transporter ready - connected to SMTP server (${env.smtp.host})`))
  .catch((err) => console.error('❌ Email transporter verification failed:', err.message));

const sendOtpEmail = async (toEmail, otpCode, retries = 2) => {
  const mailOptions = {
    from: `"TraceIT - Lost & Found" <${env.smtp.user}>`,
    to: toEmail,
    subject: 'Kode OTP Reset Password - TraceIT',
    html: `
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
    `,
  };

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${toEmail} (attempt ${attempt}): ${info.response}`);
      return true;
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed to send email to ${toEmail}:`, error.message);
      if (attempt <= retries) {
        console.log(`🔄 Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw new Error('Failed to send OTP email after multiple attempts');
      }
    }
  }
};

module.exports = {
  sendOtpEmail,
};
