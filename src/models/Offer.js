const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  discountPercentage: Number,
  validUntil: Date,
  code: String,
  cruise: { type: mongoose.Schema.Types.ObjectId, ref: 'Cruise' } // Optional: specific to a cruise
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
