require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    logger.info('Database connection established successfully');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(
      { err: error },
      'Unable to connect to the database'
    );

    process.exit(1);
  }
};

startServer();