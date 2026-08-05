const express = require('express');
const router = express.Router();

const cruiseRoutes = require('./cruise.routes');
const enquiryRoutes = require('./enquiry.routes');

router.use('/cruises', cruiseRoutes);
router.use('/enquiries', enquiryRoutes);

module.exports = router;
