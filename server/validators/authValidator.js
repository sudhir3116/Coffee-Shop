const { body, validationResult } = require('express-validator');

/**
 * Middleware to handle express-validator validation results.
 * Returns 400 Bad Request with formatted validation errors if rules are violated.
 */
const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation chain for registering a new administrator.
 */
const registerAdminValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Invalid email address format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 255 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .optional()
    .trim()
    .isIn(['Super Admin', 'Admin'])
    .withMessage('Role must be one of: Super Admin, Admin'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Phone number must be a valid 10-digit Indian mobile number'),
  body('profileImage')
    .optional()
    .trim(),
  validateResult
];

/**
 * Validation chain for administrator login.
 */
const loginValidator = [
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Invalid email address format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateResult
];

/**
 * Validation chain for changing password.
 */
const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8, max: 255 })
    .withMessage('New password must be at least 8 characters long'),
  validateResult
];

module.exports = {
  registerAdminValidator,
  loginValidator,
  changePasswordValidator
};
