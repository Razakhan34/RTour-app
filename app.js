const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utilis/appError');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./router/tourRouter');
const userRouter = require('./router/userRouter');
const reviewRouter = require('./router/reviewRouter');
const viewRouter = require('./router/viewRouter');
const bookingRouter = require('./router/bookingRouter');

const app = express();

// Setting pug template in express
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARE
// Serving static file
app.use(express.static(path.join(__dirname, 'public')));

const corsOptions = {
  origin: '*',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
// for parsing data from url when we send it to via form action='' and method='post' with name attribute input like we do in php
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ROUTER
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
