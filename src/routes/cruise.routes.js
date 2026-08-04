const express = require('express');
const router = express.Router();
const cruiseController = require('../controllers/cruise.controller');

// GET /api/cruises
router.get('/', cruiseController.getCruises);

// GET /api/cruises/:slug
router.get('/:slug', cruiseController.getCruiseBySlug);

module.exports = router;
