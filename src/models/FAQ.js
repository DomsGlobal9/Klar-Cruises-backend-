const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, enum: ['Booking', 'Onboard', 'Dining', 'Cabins', 'Excursions', 'General'], default: 'General' },
  cruiseLine: { type: mongoose.Schema.Types.ObjectId, ref: 'CruiseLine' }
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);
