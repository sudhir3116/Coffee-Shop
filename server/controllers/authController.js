const authService = require('../services/authService');

/**
 * Controller handling request and response logic for Authentication endpoints.
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Creates/Registers a new administrator.
   */
  async registerAdmin(req, res) {
    try {
      const admin = await authService.registerAdmin(req.body);

      // Return details excluding sensitive password
      return res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          phone: admin.phone,
          profileImage: admin.profileImage
        }
      });
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred during admin registration'
      });
    }
  }

  /**
   * POST /api/auth/login
   * Validates credentials and returns JWT token.
   */
  async loginAdmin(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginAdmin(email, password);

      return res.status(200).json({
        success: true,
        token: result.token,
        admin: result.admin
      });
    } catch (error) {
      if (error.statusCode === 401) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }
      if (error.statusCode === 403) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred during login'
      });
    }
  }

  /**
   * GET /api/auth/profile
   * Retrieves profile details of the authenticated administrator.
   */
  async getProfile(req, res) {
    try {
      const admin = req.admin;
      return res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          phone: admin.phone,
          profileImage: admin.profileImage,
          isActive: admin.isActive,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while fetching profile'
      });
    }
  }

  /**
   * PATCH /api/auth/change-password
   * Updates administrator password.
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.admin._id, currentPassword, newPassword);

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error.statusCode === 401) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred during password change'
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Logs out the user.
   */
  async logoutAdmin(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred during logout'
      });
    }
  }
}

module.exports = new AuthController();
