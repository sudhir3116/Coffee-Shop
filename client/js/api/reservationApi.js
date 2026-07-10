/**
 * API service for Reservation-related endpoints.
 */
const reservationApi = {
  /**
   * Submit a new table reservation booking.
   * @param {Object} data - Payload containing reservation details.
   * @returns {Promise<Object>} API response payload.
   */
  createReservation(data) {
    return window.api.post('/reservations', data);
  }
};

window.reservationApi = reservationApi;
