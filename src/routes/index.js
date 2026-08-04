const express = require('express');
const router = express.Router();

const cruiseRoutes = require('./cruise.routes');
const enquiryRoutes = require('./enquiry.routes');
// const shipRoutes = require('./ship.routes');
// const destinationRoutes = require('./destination.routes');
// const cruiseLineRoutes = require('./cruiseLine.routes');

router.use('/cruises', cruiseRoutes);
router.use('/enquiries', enquiryRoutes);
// router.use('/ships', shipRoutes);
// router.use('/destinations', destinationRoutes);
// router.use('/cruise-lines', cruiseLineRoutes);

module.exports = router;
