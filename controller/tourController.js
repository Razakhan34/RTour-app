const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../model/tourModel');
const AppError = require('../utilis/appError');
const catchAsyncError = require('../utilis/catchAsyncError');
const factory = require('./handleFactory');

// All Related to tour images in update using MULTER
const multerStorage = multer.memoryStorage();
const multerFiler = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image . please upload only images'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFiler,
});
// if you'are uploading single image and same type multiple images too.
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
exports.getToursWithin = catchAsyncError(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.resizeTourImages = catchAsyncError(async (req, res, next) => {
  if (!req.files) return next();
  // FOR IMAGECOVER
  if (req.files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
  }

  // FOR IMAGES
  if (req.files.images) {
    req.body.images = [];
    const imagesPromises = req.files.images.map(async (file, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    });
    await Promise.all(imagesPromises);
  }
  next();
});

// if you're uploading only one file
// upload.single(namefile)
// if you're uploading only multiple images
// upload.array(namefile,maxCount)

exports.aliasTop5Tours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  req.query.fields = 'name,difficulty,duration,price,ratingsAverage,summary';
  next();
};

exports.getAllTours = factory.readAllDocuments(Tour);

// exports.getAllTours = catchAsyncError(async (req, res) => {
//   // Executing query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();

//   const tours = await features.query;

//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });

exports.getSingleTour = factory.readOneDocument(Tour, { path: 'reviews' });
// exports.getSingleTour = catchAsyncError(async (req, res, next) => {
//   // Tour.findOne({_id:req.params.id}) //behind the scene
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   if (!tour) {
//     return next(new AppError(`No Tour found with ${req.params.id} id`, 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// });
// we will transfer to another file and i will replace  try catch with catchAsyncError
// const catchAsyncError = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };

exports.createTour = factory.createOneDocument(Tour);
// exports.createTour = catchAsyncError(async (req, res, next) => {
//const newTour = new Tour(req.body);
// newTour.save();
// const newTour = await Tour.create(req.body);
// res.status(201).json({
//   status: 'success',
//   data: {
//     tour: newTour,
//   },
// });
// try {
//   // const newTour = new Tour(req.body);
//   // newTour.save();
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// } catch (err) {
//   res.status(400).json({
//     status: 'fail',
//     message: 'Invalid data sent ' + err.message,
//   });
// }
// });

exports.updateTour = factory.updateOneDocument(Tour);
// exports.updateTour = catchAsyncError(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id);
//   if (!tour) {
//     return next(new AppError(`No Tour found with ${req.params.id} id`, 404));
//   }

//   const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: updatedTour,
//     },
//   });
// });
// created function in handleFactory file
exports.deleteTour = factory.deleteOneDocument(Tour);
// exports.deleteTour = catchAsyncError(async (req, res, next) => {
//   // const tour = await Tour.findById(req.params.id);
//   // if (!tour) {
//   //   return res.status(404).json({
//   //     status: 'fail',
//   //     message: `Tour doesn't exists with ${req.params.id} id`,
//   //   });
//   // }
//   // tour.remove();
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError(`No Tour found with ${req.params.id} id`, 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
