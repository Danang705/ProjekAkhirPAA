const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.util');
const { verifyToken, generateToken } = require('../utils/jwt.util');

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Name, email, and password are required');
    }

    const user = await authService.registerUser({ name, email, password, phone });
    return successResponse(res, 201, 'User registered successfully', user);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    const data = await authService.loginUser(email, password);
    return successResponse(res, 200, 'Login successful', data);
  } catch (error) {
    return errorResponse(res, 401, error.message);
  }
};

const logout = async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token in the DB/Redis
    // For now, client just deletes the token
    return successResponse(res, 200, 'Logout successful');
  } catch (error) {
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await authService.getUserById(userId);
    return successResponse(res, 200, 'User profile fetched successfully', user);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return errorResponse(res, 400, 'Refresh token is required');

    const decoded = verifyToken(refreshToken, true);
    if (!decoded) {
      return errorResponse(res, 401, 'Invalid refresh token');
    }

    const payload = { id: decoded.id, email: decoded.email };
    const newAccessToken = generateToken(payload, false);
    
    return successResponse(res, 200, 'Token refreshed', { accessToken: newAccessToken });
  } catch (error) {
    return errorResponse(res, 401, 'Invalid refresh token');
  }
};

// Stubs for OTP and Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email is required');

    const otpCode = await authService.generateOtp(email);
    
    // Send email using our new email service asynchronously to prevent request timeouts
    const emailService = require('../services/email.service');
    emailService.sendOtpEmail(email, otpCode).catch(console.error);

    return successResponse(res, 200, 'OTP sent to email successfully');
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) return errorResponse(res, 400, 'Email and OTP code are required');

    const resetToken = await authService.verifyOtpCode(email, otpCode);
    return successResponse(res, 200, 'OTP verified successfully', { resetToken });
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return errorResponse(res, 400, 'Reset token and new password are required');
    }

    await authService.resetPassword(resetToken, newPassword);
    return successResponse(res, 200, 'Password reset successfully');
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  verifyOtp,
  resetPassword
};
