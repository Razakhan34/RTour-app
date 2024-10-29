const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsyncError = require('../utilis/catchAsyncError');
const AppError = require('../utilis/appError');
const factory = require('./handleFactory');
const Tour = require('../model/tourModel');

exports.getCheckoutSession = catchAsyncError(async (req, res, next) => {
  // 1) Get current booked tour data
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'inr',
          unit_amount: tour.price,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  // 3) send checkout session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});
