/**
 * API service for Admin Authentication.
 */
const authApi = {
  /**
   * Log in an administrator.
   */
  async login(email, password) {
    return await window.api.post('/auth/login', { email, password });
  },

  /**
   * Fetch current administrator profile.
   * Sends Authorization Bearer header.
   */
  async getProfile() {
    const token = localStorage.getItem('admin_token');
    return await window.api.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  /**
   * Update administrator password.
   */
  async changePassword(currentPassword, newPassword) {
    const token = localStorage.getItem('admin_token');
    return await window.api.patch('/auth/change-password', {
      currentPassword,
      newPassword
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

window.authApi = authApi;
