require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aurelia';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Only listen if not running in a serverless environment like Vercel
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// Export the Express API for Vercel Serverless Functions
module.exports = app;
