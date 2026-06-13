const bcrypt = require('bcrypt');

const saltRounds = 10;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const validatePasswordComplexity = (password) => {
  if (!password || password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigits = /[0-9]/.test(password);
  const combineCount = (hasUppercase ? 1 : 0) + (hasLowercase ? 1 : 0) + (hasDigits ? 1 : 0);
  return combineCount >= 2;
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordComplexity,
};
