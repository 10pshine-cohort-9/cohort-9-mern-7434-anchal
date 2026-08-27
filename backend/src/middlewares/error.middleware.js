const logger = require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  logger.error(
    {
      err: error,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      userId: req.user?.id,
    },
    'Request failed'
  );

  const response = {
    success: false,
    message:
      statusCode >= 500
        ? 'Internal server error'
        : error.message || 'Request failed',
  };

  if (statusCode < 500 && error.details) {
    response.errors = error.details;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;