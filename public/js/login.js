/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const signup = async function (userData) {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/v1/users/signup',
      userData
    );
    console.log(response);
    if (response.data.status === 'success') {
      showAlert('success', 'Signup up successfully , Login now');
      setTimeout(() => window.location.assign('/login'), 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/v1/users/login',
      {
        email,
        password,
      }
    );
    if (response.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      setTimeout(() => location.assign('/'), 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const response = await axios.get(
      'http://localhost:5000/api/v1/users/logout'
    );
    if (response.data.status === 'success') {
      showAlert('success', 'Logged out successfully');
      setTimeout(() => location.reload(true), 1000);
    }
  } catch (err) {
    showAlert('error', 'Something went wrong, try again later');
  }
};
