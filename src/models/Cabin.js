const mongoose = require('mongoose');

const cabinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
  category: { type: String, enum: ['Interior', 'Ocean View', 'Balcony', 'Suite', 'Grand Suite'], required: true },
  size: Number, // sq ft
  guests: Number,
  bedType: String,
  amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenity' }]
}, { timestamps: true });

module.exports = mongoose.model('Cabin', cabinSchema);
