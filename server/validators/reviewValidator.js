const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results.
 * Returns 400 Bad Request with details if validation fails.
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
 * Validation rules for creating a new review.
 */
const createReviewValidator = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Customer name must be between 3 and 100 characters'),
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Invalid email address format'),
  body('menuItem')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid menuItem ID format'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Review title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Review title must be between 5 and 100 characters'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review comment must be between 10 and 1000 characters'),
  validateResult
];

/**
 * Validation rules for updating a review.
 */
const updateReviewValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID format'),
  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Customer name must be between 3 and 100 characters'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Review title must be between 5 and 100 characters'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review comment must be between 10 and 1000 characters'),
  validateResult
];

/**
 * Validation rules for updating featured status.
 */
const updateFeaturedValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID format'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  validateResult
];

/**
 * Validation rules for adding an admin reply.
 */
const adminReplyValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID format'),
  body('adminReply')
    .trim()
    .notEmpty()
    .withMessage('Admin reply content is required')
    .isString()
    .withMessage('Admin reply must be a string'),
  validateResult
];

/**
 * Validation rules for ID parameters in endpoints.
 */
const idParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID format'),
  validateResult
];

module.exports = {
  createReviewValidator,
  updateReviewValidator,
  updateFeaturedValidator,
  adminReplyValidator,
  idParamValidator
};
