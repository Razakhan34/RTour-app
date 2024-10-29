const dotenv = require('dotenv');
const mongoose = require('mongoose');

// For handling SYNC code like programming error in our aplication
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 💣. Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// Database connection
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  .then((con) => {
    console.log(
      `datababe connection successfully running on ${con.connection.host}`
    );
  });

// START SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on ${port} port ...`);
});

// For handling async code if it get reject in our aplication
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLE REJECTION 💣. Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
