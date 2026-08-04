const mongoose = require('mongoose');

const cruiseLineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  logo: String,
  foundedYear: Number,
  headquarters: String,
  luxuryLevel: { type: String, enum: ['Premium', 'Ultra Premium', 'Luxury', 'Expedition'], default: 'Luxury' }
}, { timestamps: true });

module.exports = mongoose.model('CruiseLine', cruiseLineSchema);
