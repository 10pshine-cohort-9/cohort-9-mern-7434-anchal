const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/error.middleware');
const authRoutes = require('./routes/auth.routes');
const noteRoutes = require('./routes/note.routes');

const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Notes App API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.use(errorHandler);

module.exports = app;