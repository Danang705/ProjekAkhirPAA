const supabase = require('../config/supabase');
const { hashPassword, comparePassword } = require('../utils/password.util');
const { generateToken } = require('../utils/jwt.util');

const registerUser = async (data) => {
  const { name, email, password, phone } = data;

  // 1. Check if user exists
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // 2. Hash password
  const hashedPassword = await hashPassword(password);

  // We no longer auto-assign admin based on email
  const role = 'user';

  // 3. Insert user
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([
      { name, email, password_hash: hashedPassword, phone, role }
    ])
    .select('id, name, email, phone, avatar_url, address, is_banned, created_at')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return newUser;
};

const loginUser = async (email, password) => {
  // 1. Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new Error('Invalid email or password');
  }

  if (user.is_banned) {
    throw new Error('Your account is banned. Please contact support.');
  }

  // 2. Verify password
  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // 3. Generate tokens
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateToken(payload, false);
  const refreshToken = generateToken(payload, true);

  // Remove password_hash from response
  delete user.password_hash;

  return { user, accessToken, refreshToken };
};

const getUserById = async (id) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, phone, avatar_url, address, is_banned, created_at')
    .eq('id', id)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  return user;
};

const generateOtp = async (email) => {
  // Check if user exists
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new Error('Email not found in our records');
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

  // Save to DB
  const { error: insertError } = await supabase
    .from('otps')
    .insert([{ email, otp_code: otpCode, expires_at: expiresAt }]);

  if (insertError) {
    throw new Error('Failed to generate OTP');
  }

  return otpCode;
};

const verifyOtpCode = async (email, otpCode) => {
  const { data: otpRecord, error } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .eq('otp_code', otpCode)
    .eq('is_used', false)
    .single();

  if (error || !otpRecord) {
    throw new Error('Invalid or expired OTP');
  }

  if (new Date(otpRecord.expires_at) < new Date()) {
    throw new Error('OTP has expired');
  }

  // Mark as used
  await supabase
    .from('otps')
    .update({ is_used: true })
    .eq('id', otpRecord.id);

  // Generate a temporary reset token (valid for 15 mins) to allow password reset
  const resetToken = generateToken({ email, purpose: 'reset' }, false); 
  // We can reuse the access token logic for this short-lived reset token

  return resetToken;
};

const resetPassword = async (resetToken, newPassword) => {
  // Verify the reset token
  const decoded = require('../utils/jwt.util').verifyToken(resetToken, false);
  
  if (!decoded || decoded.purpose !== 'reset' || !decoded.email) {
    throw new Error('Invalid or expired reset token');
  }

  const hashedPassword = await hashPassword(newPassword);

  const { error } = await supabase
    .from('users')
    .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
    .eq('email', decoded.email);

  if (error) {
    throw new Error('Failed to reset password');
  }

  return true;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  generateOtp,
  verifyOtpCode,
  resetPassword
};
