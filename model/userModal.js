const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
    minlength: [3, 'Name must have atleast 3 character long'],
    maxlength: [40, 'Name must have atmost 40 charcter long'],
  },
  email: {
    type: String,
    required: [true, 'Please provide a email'],
    trim: true,
    unique: true,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: 'Email is not valid',
    },
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Your password must be atleast 8 character long'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please provide confirm password'],
    validate: {
      // This function only work in CREATE or SAVE method not for update etc
      validator: function (value) {
        return this.password === value;
      },
      message: "password and confirm password doesn't match",
    },
  },
  changePasswordAt: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// middleware for hashing user password before saving to database
userSchema.pre('save', async function (next) {
  // this only work if we are modifying our password
  if (!this.isModified('password')) return next();

  // THis will hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // we are not saving confirm password to db
  this.confirmPassword = undefined;
  next();
});
// middleware for changingPasswordAt property because we are going to use thing in two places reset password , update password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // we are decresing 1second so that jwt can issued after changing password time (remember changePasswordAfter document method)
  this.changePasswordAt = Date.now() - 1000;
  next();
});
//  query middleware for selecting all user that are currecntly active
userSchema.pre(/^find/, function (next) {
  // this will point to current query
  this.find({ active: { $ne: false } });
  next();
});

// check user password match with hash bcrypt password
userSchema.methods.verifyPassword = async function (
  candidatePassword,
  userPassword
) {
  // this.password (we can't use because user password is select false in modal)
  return await bcrypt.compare(candidatePassword, userPassword);
};

// generating jwt token
// secret code must be or above 32 chracter long
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
// to check user change password after issuing token
userSchema.methods.changePasswordAfter = function (JWTTimeStamp) {
  if (this.changePasswordAt) {
    const changePasswordTimestamp = parseInt(
      this.changePasswordAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changePasswordTimestamp;
  }
  // false means NOT CHANGED
  return false;
};

// Generate random reset password token for forget password
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const hashResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const resetTokenExpire = Date.now() + 10 * 60 * 1000;
  this.resetPasswordToken = hashResetToken;
  this.resetPasswordExpire = resetTokenExpire;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
