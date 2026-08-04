const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: String,
  description: String,
  dressCode: { type: String, default: 'Smart Casual' },
  reservationRequired: { type: Boolean, default: false },
  image: String,
  priceCategory: { type: String, enum: ['Included', 'Specialty ($)', 'Premium ($$)'], default: 'Included' }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
