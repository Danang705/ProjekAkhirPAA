const { Resend } = require('resend');
const env = require('../config/env');

const resend = new Resend(env.resendApiKey);

const sendOtpEmail = async (toEmail, otpCode) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TraceIT <onboarding@resend.dev>',
      to: [toEmail],
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
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      throw new Error(error.message || 'Failed to send OTP email');
    }

    console.log(`✅ OTP email sent to ${toEmail}, id: ${data.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${toEmail}:`, error.message);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = {
  sendOtpEmail,
};
