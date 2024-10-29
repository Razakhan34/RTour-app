/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/v1/users/forgotPassword',
      {
        email,
      }
    );
    console.log('Working');
    if (response.data.status === 'success') {
      showAlert('success', response.data.message);
      setTimeout(() => window.location.assign('/'), 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const resetPassword = async (userInfo) => {
  const qs = window.location.pathname.split('/');
  const token = qs[qs.length - 1];
  try {
    const response = await axios.patch(
      `http://localhost:5000/api/v1/users/resetPassword/${token}`,
      userInfo
    );
    if (response.data.status === 'success') {
      showAlert('success', response.data.message);
      setTimeout(() => window.location.assign('/login'), 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
