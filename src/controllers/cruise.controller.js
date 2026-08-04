const cruiseService = require('../services/cruise.service');

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
