const express = require('express');
const router = express.Router();
const cruiseController = require('../controllers/cruise.controller');

// GET /api/cruises
router.get('/', cruiseController.getCruises);

// GET /api/cruises/match — must precede `/:slug`, which would otherwise
// capture "match" as a slug and 404.
router.get('/match', cruiseController.matchCruises);

// GET /api/cruises/:slug
router.get('/:slug', cruiseController.getCruiseBySlug);

module.exports = router;
