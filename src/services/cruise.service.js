const cruiseRepository = require('../repositories/cruise.repository');
const Gallery = require('../models/Gallery');
const Review = require('../models/Review');
const FAQ = require('../models/FAQ');

class CruiseService {
  async getCruises(query = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    // Process search query if any
    const dbQuery = {};
    if (query.destination) dbQuery.destination = query.destination;
    if (query.cruiseLine) dbQuery.cruiseLine = query.cruiseLine;
    
    const [cruises, total] = await Promise.all([
      cruiseRepository.findCruisesWithBasicInfo(dbQuery, { skip, limit, sort: { rating: -1 } }),
      cruiseRepository.count(dbQuery)
    ]);
    
    return {
      data: cruises,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getCruiseDetails(slug) {
    const cruise = await cruiseRepository.getCruiseBySlug(slug);
    
    if (!cruise) {
      throw new Error('Cruise not found');
    }

    // Fetch related cross-cutting concerns (Gallery, Reviews, FAQs)
    const [gallery, reviews, faqs] = await Promise.all([
      Gallery.find({ referenceModel: 'Cruise', referenceId: cruise._id }).lean(),
      Review.find({ cruise: cruise._id }).sort({ date: -1 }).limit(10).lean(),
      FAQ.find({ category: { $in: ['General', 'Booking'] } }).limit(5).lean() // Example logic
    ]);

    // Construct the full object for the frontend details page
    return {
      ...cruise,
      gallery,
      reviews,
      faqs
    };
  }
}

module.exports = new CruiseService();
