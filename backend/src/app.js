const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/error.middleware');
const authRoutes = require('./routes/auth.routes');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Notes App API is running',
    });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);
module.exports = app;
