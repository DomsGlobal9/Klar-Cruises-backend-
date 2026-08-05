const cruiseService = require('../services/cruise.service');
const matchService = require('../services/match.service');

/**
 * GET /api/cruises/match?q=...
 * Matches a plain-English request against the catalogue.
 */
exports.matchCruises = async (req, res, next) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.status(400).json({ error: 'A search query is required' });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 3, 10);
    const result = await matchService.matchCruises(query, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCruises = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Extract filters
    const query = {};
    if (req.query.destination) query.destination = req.query.destination;
    if (req.query.cruiseLine) query.cruiseLine = req.query.cruiseLine;

    const result = await cruiseService.getCruises(query, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCruiseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cruise = await cruiseService.getCruiseDetails(slug);
    
    res.status(200).json({ data: cruise });
  } catch (error) {
    if (error.message === 'Cruise not found') {
      return res.status(404).json({ error: 'Cruise not found' });
    }
    next(error);
  }
};
