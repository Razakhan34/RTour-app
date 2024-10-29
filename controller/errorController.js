const AppError = require('../utilis/appError');

const sendError = (err, req, res) => {
  // FOR API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // FOR RENDERED WEBSITE
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path} : ${err.value}`;
    err = new AppError(message, 400);
  }
  if (err.code === 11000) {
    const [key, value] = Object.entries(err.keyValue).flat();
    const message = `Duplicate field value : ${value} .This ${key} is Already Exit. please enter another value`;
    err = new AppError(message, 400);
  }
  if (err.name === 'ValidationError') {
    const value = Object.values(err.errors).map(
      (currError) => currError.message
    );
    const message = `Invalid Input data. ${value.join('. ')}`;
    err = new AppError(message, 400);
  }
  if (err.name === 'JsonWebTokenError') {
    const message = `Invalid token. please log in again!!`;
    err = new AppError(message, 401);
  }
  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. please login again';
    err = new AppError(message, 401);
  }
  sendError(err, req, res);
};
