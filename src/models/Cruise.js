const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: String,
  description: String,
  port: { type: mongoose.Schema.Types.ObjectId, ref: 'Port' },
  isAtSea: { type: Boolean, default: false }
});

const cruiseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  heroImage: String,
  price: Number,
  duration: Number, // nights
  rating: { type: Number, default: 4.5 },
  
  luxuryLevel: { type: String, enum: ['Premium', 'Ultra Premium', 'Luxury', 'Expedition'], default: 'Luxury' },
  difficulty: { type: String, enum: ['Relaxed', 'Moderate', 'Active'], default: 'Relaxed' },
  bestSeason: String,
  familyFriendly: { type: Boolean, default: true },
  highlights: [String],

  cruiseLine: { type: mongoose.Schema.Types.ObjectId, ref: 'CruiseLine', required: true },
  ship: { type: mongoose.Schema.Types.ObjectId, ref: 'Ship', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  
  departurePort: { type: mongoose.Schema.Types.ObjectId, ref: 'Port', required: true },
  arrivalPort: { type: mongoose.Schema.Types.ObjectId, ref: 'Port', required: true },
  
  itinerary: [itineraryDaySchema]
}, { timestamps: true });

// Add text index for search capabilities
cruiseSchema.index({ name: 'text', description: 'text' });
cruiseSchema.index({ slug: 1 });
cruiseSchema.index({ destination: 1 });
cruiseSchema.index({ cruiseLine: 1 });

module.exports = mongoose.model('Cruise', cruiseSchema);
