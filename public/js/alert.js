/* eslint-disable */

export const hideAlert = () => {
  const alert = document.querySelector('.alert');
  if (alert) alert.parentElement.removeChild(alert);
};

// type will be either success or error
export const showAlert = (type, msg) => {
  hideAlert();
  const alert = `<div class='alert alert--${type}'>${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', alert);
  window.setTimeout(() => hideAlert(), 3000);
};
