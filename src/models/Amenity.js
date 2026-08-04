const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: String,
  category: { type: String, enum: ['Cabin', 'Ship', 'Spa', 'Dining', 'Entertainment'], default: 'Ship' }
}, { timestamps: true });

module.exports = mongoose.model('Amenity', amenitySchema);
