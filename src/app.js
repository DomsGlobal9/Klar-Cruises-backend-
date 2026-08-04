const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/db');
require('./models'); // Register all Mongoose models
const routes = require('./routes');

// Remove global connection
// connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', async (req, res, next) => {
  try {
    await connectDB(); // Ensure DB is connected before handling any API routes
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
}, routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'AURELIA API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
