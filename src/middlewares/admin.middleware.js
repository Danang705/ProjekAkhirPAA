const { errorResponse } = require('../utils/response.util');

const requireAdmin = (req, res, next) => {
  // In a real application, you'd add a 'role' or 'is_admin' boolean to your users table
  // and include it in the JWT payload.
  // For this project, we can either check if the user has a specific admin email, 
  // or assume the token has { isAdmin: true }. 
  
  // Now we check the actual role from the JWT payload
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return errorResponse(res, 403, 'Forbidden: Admin access required');
  }
};

module.exports = {
  requireAdmin
};
