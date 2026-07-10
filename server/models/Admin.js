const mongoose = require('mongoose');

/**
 * @typedef {Object} Admin
 * @property {string} name - The administrator's full name (3-100 characters).
 * @property {string} email - Unique, lowercase email address of the administrator (validated).
 * @property {string} password - Hashed account password (hidden by default using select: false).
 * @property {string} role - Role tier: Super Admin or Admin (default: Admin).
 * @property {string} profileImage - Profile image URL or file path.
 * @property {string} [phone] - Optional Indian mobile phone number (validated if provided).
 * @property {boolean} isActive - Toggle to enable or disable the admin's account (default: true).
 * @property {Date} [lastLogin] - Timestamp of the last successful login.
 * @property {Date} [passwordChangedAt] - Timestamp recording when the password was last modified.
 * @property {number} loginAttempts - Counter tracking consecutive failed login attempts.
 * @property {Date} [lockUntil] - Timestamp indicating when the account lock expires.
 * @property {boolean} isDeleted - Soft delete flag for admin accounts.
 * @property {boolean} isLocked - Virtual property indicating if the account is currently locked out.
 * @property {Date} createdAt - Timestamp of document creation.
 * @property {Date} updatedAt - Timestamp of last modification.
 */

/**
 * Admin Schema
 * Defines the structure, validations, methods, and indexes for administrative users.
 */
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Administrator name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Regular expression for standard email validation
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address`
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      maxlength: [255, 'Password cannot exceed 255 characters'],
      // Rationale: select: false prevents the password from being returned in query results by default.
      // This protects against accidental disclosure in logs, API responses, or JSON exports.
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ['Super Admin', 'Admin'],
        message: '{VALUE} is not a valid admin role'
      },
      default: 'Admin'
    },
    profileImage: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // If no phone number is provided, validation passes (field is optional)
          if (!v) return true;
          // Validates exactly 10 digits starting with 6, 7, 8, or 9 (Indian mobile format)
          return /^[6-9]\d{9}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit Indian mobile number`
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    passwordChangedAt: {
      // Rationale: passwordChangedAt is useful for invalidating older JSON Web Tokens (JWT) or sessions
      // issued before the password update timestamp, ensuring compromised tokens are rendered useless.
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0,
      min: [0, 'Login attempts cannot be negative']
    },
    lockUntil: {
      // Rationale: Account locking exists to mitigate brute-force and credential-stuffing attacks.
      // After excessive failed attempts, the account is temporarily locked, introducing time delays.
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'admins',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes to speed up lookups and enforce uniqueness
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

/**
 * Virtual property indicating if the account is currently locked.
 * Returns true if lockUntil is set and the lockout expiration date is in the future.
 */
adminSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Instance method to increment login attempts and lock account if limit reached.
 * Automatically locks the account for 2 hours after 5 consecutive failures.
 * @returns {Promise<Document>} The saved Admin document
 */
adminSchema.methods.incrementLoginAttempts = async function () {
  // If a lockout window has already expired, reset attempts to 1 and remove the lock
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
    return this.save();
  }

  this.loginAttempts += 1;

  // Lock account for 2 hours if failed attempts reach or exceed 5
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours in milliseconds
  }

  return this.save();
};

/**
 * Instance method to reset failed login attempts and unlock the account.
 * @returns {Promise<Document>} The saved Admin document
 */
adminSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

/**
 * Static method to find an active, non-deleted administrator by email.
 * @param {string} email - The email address to look up
 * @returns {Query} Mongoose query yielding the Admin document
 */
adminSchema.statics.findActiveAdminByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    isActive: true,
    isDeleted: false
  });
};

// Create and export the Admin model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
