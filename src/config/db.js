const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aurelia';
    cached.promise = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // Don't hang for 30s on Vercel
    }).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`Error connecting to MongoDB: ${e.message}`);
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
