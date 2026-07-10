w/**
 * API service for Contact-related endpoints.
 */
const contactApi = {
  /**
   * Submit a new customer contact message.
   * @param {Object} data - Payload containing name, email, subject, message.
   * @returns {Promise<Object>} API response payload.
   */
  submitContact(data) {
    return window.api.post('/contact', data);
  }
};

window.contactApi = contactApi;
