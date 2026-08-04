const BaseRepository = require('./base.repository');
const Cruise = require('../models/Cruise');

class CruiseRepository extends BaseRepository {
  constructor() {
    super(Cruise);
    
    // Deep populate definition for the detail page
    this.detailPopulate = [
      { path: 'cruiseLine' },
      { path: 'destination' },
      { path: 'departurePort' },
      { path: 'arrivalPort' },
      { 
        path: 'ship',
        populate: [
          { path: 'cabins', populate: { path: 'amenities' } },
          { path: 'restaurants' },
          { path: 'experiences' }
        ]
      },
      { path: 'itinerary.port' }
    ];
  }

  async findCruisesWithBasicInfo(query = {}, options = {}) {
    const { skip, limit, sort } = options;
    
    return await this.find(query, {
      skip,
      limit,
      sort,
      populate: ['cruiseLine', 'destination', 'ship', 'departurePort', 'arrivalPort']
    });
  }

  async getCruiseBySlug(slug) {
    return await this.findOne({ slug }, { populate: this.detailPopulate });
  }
}

module.exports = new CruiseRepository();
