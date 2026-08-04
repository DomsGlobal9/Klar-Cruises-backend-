const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    // Contact details
    fullName:  { type: String, trim: true },
    email:     { type: String, trim: true, lowercase: true },
    phone:     { type: String, trim: true },
    country:   { type: String, trim: true },

    // Voyage preferences
    destination:   { type: String, trim: true },
    departureDate: { type: String, trim: true },
    duration:      { type: String, trim: true },
    numberOfGuests:{ type: String, trim: true },
    cabinPreference: { type: String, trim: true },

    // Extra
    message:        { type: String, trim: true },
    receiveOffers:  { type: Boolean, default: false },

    // Tracking
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

enquirySchema.index({ email: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
