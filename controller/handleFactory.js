const AppError = require('../utilis/appError');
const catchAsyncError = require('../utilis/catchAsyncError');
const APIFeatures = require('../utilis/apiFeatures');

exports.createOneDocument = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    const newDocument = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newDocument,
      },
    });
  });
};

exports.readAllDocuments = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    // for getting all review on specific tour tour/review but i did with middleware check reviewController
    // let filter = {};
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
};

exports.readOneDocument = (Model, populateOption) => {
  return catchAsyncError(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOption) query = query.populate(populateOption);
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`No Document Found with ${req.params.id} id`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

exports.updateOneDocument = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(
        new AppError(`No Document Found with ${req.params.id} id`, 404)
      );
    }

    const updatedDocument = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        data: updatedDocument,
      },
    });
  });
};

exports.deleteOneDocument = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`No Document Found with ${req.params.id} id`, 404)
      );
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
