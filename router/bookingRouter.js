const express = require('express');
const { authUser, authUserRole } = require('../controller/authController');
const bookingController = require('../controller/bookingController');

const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authUser,
  bookingController.getCheckoutSession
);

module.exports = router;
