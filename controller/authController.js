const Email = require('../utilis/email');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModal');
const AppError = require('../utilis/appError');
const catchAsyncError = require('../utilis/catchAsyncError');
const sendToken = require('../utilis/sendToken');

exports.signup = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    // we are doing like this so that user can't enter user role == admin manually in body
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    // role: req.body.role,
  });
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exits
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }
  // 2) Check user exist and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('email or password is incorrect', 401));
  }
  const isPasswordMatched = await user.verifyPassword(password, user.password);
  if (!isPasswordMatched) {
    return next(new AppError('email or password is incorrect', 401));
  }
  // 3) if everything ok , send token to client
  sendToken(res, 200, user);
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.authUser = catchAsyncError(async (req, res, next) => {
  // 1) Getting token and check it is exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! . please login to get access', 401)
    );
  }
  // 2) verifcation token
  // WITH SYNC  const decode = jwt.verify(token, process.env.JWT_SECRET,function(){})
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user is still exits
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The User belongings to this token does no longer exists',
        401
      )
    );
  }
  // 4) check if user changed the password after the token was issued
  const isUserChangePassword = currentUser.changePasswordAfter(decoded.iat);
  if (isUserChangePassword) {
    return next(
      new AppError(
        'User recently changed the password. please login again',
        401
      )
    );
  }
  //  GRANT ACCESS TO PROTECT ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    // Verify token
    const token = req.cookies.jwt;
    try {
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      // Check if user is still exits
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //  check if user changed the password after the token was issued
      const isUserChangePassword = currentUser.changePasswordAfter(decoded.iat);
      if (isUserChangePassword) {
        return next();
      }

      // there is logged in users
      // locals variable (res.locals) will be avaibale in everywhere in template it's like we are passing data in render
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.authUserRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `You do not have permission to perform this action because your are ${req.user.role}`,
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user based on posted email
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new AppError(`There is no user exists with this ${email} email`, 404)
    );
  }
  // 2) Generate the random reset token
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to the user's mail
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendResetPassword();
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Password Recovery From Natours (valid for 10 minute)',
    //   message,
    // });

    res.status(200).json({
      status: 'success',
      message: 'Token has been sent successfully to your gmail account',
    });
  } catch (err) {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(
      new AppError(
        'There was an error to sending Email , please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user based on a token
  const hashResetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashResetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');
  // 2) Check Token has not expired ,and  There is user , set new password
  if (!user) {
    return next(
      new AppError('Token is invalid or has Expired , Please try again')
    );
  }
  const isPreviousPassMatched = await user.verifyPassword(
    req.body.password,
    user.password
  );
  if (isPreviousPassMatched) {
    return next(
      new AppError(
        'You new password is same as your old password , try other password '
      )
    );
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  // 3) (update change user password time) update changedPasswordAt property for the user doing with pre('save')
  res.status(200).json({
    status: 'success',
    message: 'Your password has been changed successfully',
  });
});

exports.updateMyPassword = catchAsyncError(async (req, res, next) => {
  // Get the user from collection
  const user = await User.findById(req.user.id).select('+password');
  // verify user current password with bcrypt
  const isPasswordMatched = await user.verifyPassword(
    req.body.currentPassword,
    user.password
  );
  if (!isPasswordMatched) {
    return next(new AppError(`Your current password is not correct`, 401));
  }
  // if it's verfify then update user password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended! because pre save is not going to work
  // 3) (update change user password time) update changedPasswordAt property for the user => doing with pre('save')
  // Log in the user m send JWT
  sendToken(res, 200, user);
});
