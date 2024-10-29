/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

// type will be either 'password' or 'data'
export const updateSettings = async (updateData, type) => {
  const url =
    type === 'password'
      ? 'http://localhost:5000/api/v1/users/updateMyPassword'
      : 'http://localhost:5000/api/v1/users/updateMe';

  try {
    const response = await axios.patch(url, updateData);
    if (response.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
