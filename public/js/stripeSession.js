/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51LiCsYSADekrM2KGwVbaa9gFQntfQNaKxGkoROroiqk713JNDu6aUBqVEsgbCyz7mK5ww1ULX5KHhjLZ99rmg1lx00GRIQZmMc'
  );
  try {
    // Get checkout session from api
    const {
      data: { session },
    } = await axios.get(
      `http://localhost:5000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    // Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', `Something went wrong,  try again later`);
  }
};
