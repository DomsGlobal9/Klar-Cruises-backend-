const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: String,
  url: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['Ship', 'Cabin', 'Destination', 'Dining', 'Experience', 'Cruise', 'General'], default: 'General' },
  referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'referenceModel' },
  referenceModel: { type: String, enum: ['Ship', 'Cabin', 'Destination', 'Restaurant', 'Experience', 'Cruise'] }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
