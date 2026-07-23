const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
};

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    getJwtSecret(),
    {
      expiresIn: '1d',
    }
  );
};

module.exports = {
  generateToken,
}; 