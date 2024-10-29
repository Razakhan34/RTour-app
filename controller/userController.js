const multer = require('multer');
const sharp = require('sharp');
const User = require('../model/userModal');
const catchAsyncError = require('../utilis/catchAsyncError');
const AppError = require('../utilis/appError');
const factory = require('./handleFactory');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!!, please upload only image file'), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsyncError(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (body, ...allowedFields) => {
  const bodyObj = { ...body };
  Object.keys(bodyObj).forEach((currKey) => {
    if (!allowedFields.includes(currKey)) delete bodyObj[currKey];
  });
  return bodyObj;
};

exports.getAllUsers = factory.readAllDocuments(User);
// exports.getAllUsers = catchAsyncError(async (req, res, next) => {
//   const users = await User.find();

//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users: users,
//     },
//   });
// });

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateMe = catchAsyncError(async (req, res, next) => {
  // 1) Create error if user passing password or confirm password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This router is not for update password please use /updateMyPassword route',
        400
      )
    );
  }
  // 2) filtered out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteMe = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getSingleUser = factory.readOneDocument(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this router is not defined , use /signup instead',
  });
};

// i am not not letting admin to change any kind of user sensitive data
exports.filteredBody = function (req, res, next) {
  req.body = filterObj(req.body, 'role', 'name');
  next();
};
// This router for admin so that he can change user profile
// do not change password with this
exports.updateUser = factory.updateOneDocument(User);

// for admin so that he can delete any user with id
exports.deleteUser = factory.deleteOneDocument(User);
