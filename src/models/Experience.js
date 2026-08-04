const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String,
  category: { type: String, enum: ['Spa', 'Entertainment', 'Casino', 'Kids', 'Sports', 'Shopping', 'Other'], default: 'Other' },
  included: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);
