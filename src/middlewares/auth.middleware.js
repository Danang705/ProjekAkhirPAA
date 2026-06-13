const { verifyToken } = require('../utils/jwt.util');
const { errorResponse } = require('../utils/response.util');
const supabase = require('../config/supabase');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Unauthorized: No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 401, 'Unauthorized: Invalid or expired token');
    }

    // Verify user is not banned in the database
    const { data: user, error } = await supabase
      .from('users')
      .select('is_banned')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return errorResponse(res, 401, 'Unauthorized: User not found');
    }

    if (user.is_banned) {
      return errorResponse(res, 403, 'Your account is banned. Please contact support.');
    }

    // Attach user payload to request
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 500, 'Internal Server Error in Authentication');
  }
};

module.exports = {
  authenticate,
};
