const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Authentication token is required');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      id: decodedToken.userId,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      error.statusCode = 401;
      error.message = 'Invalid authentication token';
    }

    if (error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.message = 'Authentication token has expired';
    }

    next(error);
  }
};

module.exports = authenticateUser;

