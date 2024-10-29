const express = require('express');

const router = express.Router();

const { authUser, authUserRole } = require('../controller/authController');

const reviewRouter = require('./reviewRouter');

const {
  uploadTourImages,
  resizeTourImages,
  getAllTours,
  getSingleTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTop5Tours,
  getToursWithin,
} = require('../controller/tourController');

// Param middleware
// router.param('id', checkTourExistsWithId);

// GET /tours/736353552/reviews/
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router
  .route('/')
  .get(getAllTours)
  .post(authUser, authUserRole('lead-guide', 'admin'), createTour);

router.route('/top-5-cheap').get(aliasTop5Tours, getAllTours);

router
  .route('/:id')
  .get(getSingleTour)
  .patch(
    authUser,
    authUserRole('lead-guide', 'admin'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(authUser, authUserRole('lead-guide', 'admin'), deleteTour);

module.exports = router;
