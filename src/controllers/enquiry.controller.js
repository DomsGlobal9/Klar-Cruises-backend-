const Enquiry = require('../models/Enquiry');

/**
 * POST /api/enquiries
 * Create a new enquiry and persist it to MongoDB.
 */
exports.createEnquiry = async (req, res, next) => {
  try {
    const {
      fullName, email, phone, country,
      destination, departureDate, duration,
      numberOfGuests, cabinPreference,
      message, receiveOffers, source,
    } = req.body;

    const enquiry = await Enquiry.create({
      fullName, email, phone, country,
      destination, departureDate, duration,
      numberOfGuests, cabinPreference,
      message, receiveOffers, source,
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/enquiries
 * List all enquiries (admin use). Paginated.
 */
exports.getEnquiries = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip  = (page - 1) * limit;

    // Which tool a lead came from is the main thing worth slicing on, so it
    // is filterable here rather than left to the caller to sort out.
    const filter = {};
    if (req.query.source) filter.source = req.query.source;
    if (req.query.status) filter.status = req.query.status;

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Enquiry.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: enquiries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
