const { errorResponse } = require('../utils/response.util');

const requireAdmin = (req, res, next) => {
  // In a real application, you'd add a 'role' or 'is_admin' boolean to your users table
  // and include it in the JWT payload.
  // For this project, we can either check if the user has a specific admin email, 
  // or assume the token has { isAdmin: true }. 
  
  // Here we'll do a simple mock check (e.g., checking if the email contains 'admin')
  // Replace this with your actual admin verification logic.
  if (req.user && req.user.email && req.user.email.includes('admin')) {
    next();
  } else {
    return errorResponse(res, 403, 'Forbidden: Admin access required');
  }
};

module.exports = {
  requireAdmin
};
