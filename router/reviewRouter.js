const express = require('express');

const { authUser, authUserRole } = require('../controller/authController');
const {
  setTourUserIds,
  createReview,
  setTourIds,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require('../controller/reviewController');

const router = express.Router({ mergeParams: true });



router.use(authUser);

router
  .route('/')
  .get(setTourIds, getAllReviews)
  .post(authUserRole('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getSingleReview)
  .patch(authUserRole('user', 'admin'), updateReview)
  .delete(authUserRole('user', 'admin'), deleteReview);

module.exports = router;
