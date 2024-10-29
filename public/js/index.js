/* eslint-disable */
import '@babel/polyfill';
import { signup, login, logout } from './login';
import { forgotPassword, resetPassword } from './passwprd';
import { updateSettings } from './updateSetting';
import { bookTour } from './stripeSession';

// DOM ELEMENT
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const forgotPasswordForm = document.querySelector('.form--forgot-password');
const resetPasswordForm = document.querySelector('.form--reset-password');

const userDataForm = document.querySelector('.form-user-data');
const userPasswordFrom = document.querySelector('.form-user-password');
const mapContainer = document.getElementById('map');
const logoutBtn = document.querySelector('.nav__el--logout');
const btnBookTour = document.getElementById('btn-booktour');
// DELEGATION
if (loginForm) {
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = signupForm.querySelector('.name').value;
    const email = signupForm.querySelector('.email').value;
    const password = signupForm.querySelector('.password').value;
    const confirmPassword = signupForm.querySelector('.confirmPassword').value;
    signup({ name, email, password, confirmPassword });
  });
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = forgotPasswordForm.querySelector('.email').value;
    console.log(forgotPasswordForm);
    console.log(email);
    forgotPassword(email);
  });
}
if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const password = resetPasswordForm.querySelector('.password').value;
    const confirmPassword =
      resetPasswordForm.querySelector('.confirmPassword').value;
    resetPassword({ password, confirmPassword });
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', function (e) {
    e.preventDefault();
    // we are creating formdata for taking image file
    const data = new FormData();
    data.append('name', document.querySelector('.form-user-data #name').value);
    data.append(
      'email',
      document.querySelector('.form-user-data #email').value
    );
    data.append('photo', document.querySelector('#photo').files[0]);
    updateSettings(data, 'data');
  });
}

if (userPasswordFrom) {
  userPasswordFrom.addEventListener('submit', async function (e) {
    e.preventDefault();
    document.querySelector('.btn__save--password').textContent = 'Updating...';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    await updateSettings(
      { currentPassword, password, confirmPassword },
      'password'
    );
    document.querySelector('.btn__save--password').textContent =
      'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}


if (btnBookTour) {
  btnBookTour.addEventListener('click', function (e) {
    const tourId = this.dataset.tourId;
    bookTour(tourId);
  });
}
