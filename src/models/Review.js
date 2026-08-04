const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: String,
  avatar: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  verified: { type: Boolean, default: true },
  cruise: { type: mongoose.Schema.Types.ObjectId, ref: 'Cruise' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
