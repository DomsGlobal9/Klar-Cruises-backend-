const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  region: String,
  highlights: [String]
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
