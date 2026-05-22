const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (payload, isRefresh = false) => {
  const secret = isRefresh ? env.jwt.refreshSecret : env.jwt.accessSecret;
  const expiresIn = isRefresh ? env.jwt.refreshExpiresIn : env.jwt.accessExpiresIn;
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token, isRefresh = false) => {
  try {
    const secret = isRefresh ? env.jwt.refreshSecret : env.jwt.accessSecret;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
