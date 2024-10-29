const crypto = require('crypto');
const Tour = require('../model/tourModel');
const catchAsyncError = require('../utilis/catchAsyncError');
const AppError = require('../utilis/appError');
const User = require('../model/userModal');

exports.getOverview = catchAsyncError(async (req, res, next) => {
  // 1) Get All Tours data from collection
  const tours = await Tour.find({});
  // 2) Build template
  // 3) Render template with above tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsyncError(async (req, res, next) => {
  // 1) Get The data , for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour found with that name', 404));
  }

  // 2) Build template
  // 3) Render template by using the data from step 1
  https: res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup into your account',
  });
};

exports.getForgotPasswordForm = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot Your Password',
  });
};
exports.getResetPasswordForm = async (req, res, next) => {
  const token = req.params.token;
  // 1) Get user based on a token
  const hashResetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashResetPasswordToken,
  }).select('email');

  if (!user) {
    return next(new AppError('Token has expired , try again', 404));
  }
  res.status(200).render('resetPassword', {
    title: 'Reset Your Password',
    currentUser: user,
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

// Another way Updating user data with action='' and method='post' attribute in form not using our api
// but we will use our api
exports.updateUserData = catchAsyncError(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});
