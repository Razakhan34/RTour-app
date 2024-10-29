const Review = require('../model/reviewModal');
// const catchAsyncError = require('../utilis/catchAsyncError');
const factory = require('./handleFactory');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.createReview = factory.createOneDocument(Review);



exports.setTourIds = (req, res, next) => {
  if (req.params.tourId) req.query.tour = req.params.tourId;
  next();
};

exports.getAllReviews = factory.readAllDocuments(Review);
// exports.getAllReviews = catchAsyncError(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   // const reviews = await Review.find(filter);
//   const reviews = await Review.find({ tour: req.params.tourId });

//   res.status(201).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

exports.getSingleReview = factory.readOneDocument(Review);

exports.updateReview = factory.updateOneDocument(Review);

exports.deleteReview = factory.deleteOneDocument(Review);
// exports.deleteReview = catchAsyncError(async (req, res, next) => {
//   const tour = await Review.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError(`No Review found on ${req.params.id} id`, 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
