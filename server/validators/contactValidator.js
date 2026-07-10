const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to handle express-validator validation results.
 * If validation fails, returns a formatted 400 Bad Request error response.
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
 * Validation rules for creating a new contact message.
 * Places .trim() before .notEmpty() to ensure strings containing only whitespace are rejected.
 */
const createContactValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required and cannot be empty')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Invalid email address'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required and cannot be empty')
    .isLength({ min: 5, max: 150 })
    .withMessage('Subject must be between 5 and 150 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message body is required and cannot be empty')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  validateResult
];

/**
 * Validation rules for updating a contact message's status.
 */
const updateStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid contact ID format'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['New', 'Read', 'Replied', 'Archived'])
    .withMessage('Status must be one of: New, Read, Replied, Archived'),
  validateResult
];

/**
 * Validation rules for sending an admin reply.
 */
const adminReplyValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid contact ID format'),
  body('adminReply')
    .trim()
    .notEmpty()
    .withMessage('Admin reply content is required and cannot be empty')
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
    .withMessage('Invalid contact ID format'),
  validateResult
];

module.exports = {
  createContactValidator,
  updateStatusValidator,
  adminReplyValidator,
  idParamValidator
};
