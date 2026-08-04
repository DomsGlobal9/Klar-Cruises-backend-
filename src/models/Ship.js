const mongoose = require('mongoose');

const shipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  cruiseLine: { type: mongoose.Schema.Types.ObjectId, ref: 'CruiseLine', required: true },
  description: String,
  image: String, // Hero image for the ship
  built: Number,
  class: String,
  passengers: Number,
  crew: Number,
  length: String,
  decks: Number,
  cabins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cabin' }],
  restaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  experiences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Experience' }]
}, { timestamps: true });

module.exports = mongoose.model('Ship', shipSchema);
