const express = require('express');
const { authUser, authUserRole } = require('../controller/authController');

const router = express.Router();
const {
  uploadUserPhoto,
  resizeUserPhoto,
  getAllUsers,
  getMe,
  updateMe,
  deleteMe,
  getSingleUser,
  createUser,
  filteredBody,
  updateUser,
  deleteUser,
} = require('../controller/userController');
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateMyPassword,
} = require('../controller/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Protect all routes that come after this middleware
router.use(authUser);

router.patch('/updateMyPassword', updateMyPassword);
router.get('/me', getMe, getSingleUser);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

router.use(authUserRole('admin'));

router.route('/').get(getAllUsers).post(createUser);
router
  .route('/:id')
  .get(getSingleUser)
  .patch(filteredBody, updateUser)
  .delete(deleteUser);

module.exports = router;
