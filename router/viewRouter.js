const express = require('express');

const viewController = require('../controller/viewController');

const authController = require('../controller/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewController.getSignupForm);
router.get(
  '/forgotPassword',
  authController.isLoggedIn,
  viewController.getForgotPasswordForm
);
router.get(
  '/resetPassword/:token',
  authController.isLoggedIn,
  viewController.getResetPasswordForm
);
router.get('/me', authController.authUser, viewController.getAccount);

// Another way Updating user data with action='' and method='post' attribute in form not using our api
// but we will use our api
router.post(
  '/submit-user-data',
  authController.authUser,
  viewController.updateUserData
);

module.exports = router;
