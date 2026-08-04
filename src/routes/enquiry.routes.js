const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiry.controller');

// POST /api/enquiries
router.post('/', enquiryController.createEnquiry);

// GET /api/enquiries  (admin)
router.get('/', enquiryController.getEnquiries);

module.exports = router;
