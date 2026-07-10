const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

/**
 * Service managing database and logic operations for Admin authentication.
 */
class AuthService {
  /**
   * Register a new admin user.
   */
  async registerAdmin(adminData) {
    const { name, email, password, role, phone, profileImage } = adminData;

    // Check duplicate email
    const emailExists = await Admin.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      const err = new Error('An administrator account with this email already exists.');
      err.statusCode = 409;
      throw err;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      profileImage
    });

    return await newAdmin.save();
  }

  /**
   * Login an admin user, checking lockout states, validation credentials, and issuing JWT tokens.
   */
  async loginAdmin(email, password) {
    // Find admin by email. Note: We must explicitly select the password because it is hidden by default.
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

    if (!admin || admin.isDeleted) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    // Check if account is active
    if (!admin.isActive) {
      const err = new Error('Your account has been deactivated. Please contact support.');
      err.statusCode = 403;
      throw err;
    }

    // Check lockout status
    if (admin.isLocked) {
      const lockTimeRemaining = Math.ceil((admin.lockUntil - Date.now()) / 60000);
      const err = new Error(`Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.`);
      err.statusCode = 403;
      throw err;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      // Increment failed login attempt
      await admin.incrementLoginAttempts();

      if (admin.isLocked) {
        const err = new Error('Too many failed login attempts. Account locked for 2 hours.');
        err.statusCode = 403;
        throw err;
      }

      const attemptsRemaining = 5 - admin.loginAttempts;
      const err = new Error(`Invalid email or password. ${attemptsRemaining} attempts remaining before lockout.`);
      err.statusCode = 401;
      throw err;
    }

    // Success: Reset login attempts and set last login date
    await admin.resetLoginAttempts();
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = generateToken(admin._id);

    return {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    };
  }

  /**
   * Change admin password.
   */
  async changePassword(adminId, currentPassword, newPassword) {
    const admin = await Admin.findById(adminId).select('+password');
    if (!admin || admin.isDeleted) {
      const err = new Error('Administrator not found.');
      err.statusCode = 404;
      throw err;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      const err = new Error('Current password is incorrect.');
      err.statusCode = 401;
      throw err;
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    admin.password = hashedNewPassword;
    admin.passwordChangedAt = new Date();
    return await admin.save();
  }
}

module.exports = new AuthService();
