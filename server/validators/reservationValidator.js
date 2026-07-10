const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to handle express-validator validation results.
 * Returns 400 Bad Request if validation rules are violated.
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
 * Validation chain for creating a reservation.
 */
const createReservationValidator = [
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
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Phone number must be a valid 10-digit Indian mobile number starting with 6-9'),
  body('reservationDate')
    .trim()
    .notEmpty()
    .withMessage('Reservation date is required')
    .isISO8601()
    .withMessage('Reservation date must be a valid ISO 8601 date format')
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(value);
      inputDate.setHours(0, 0, 0, 0);
      if (inputDate < today) {
        throw new Error('Reservation date cannot be in the past');
      }
      return true;
    }),
  body('reservationTime')
    .trim()
    .notEmpty()
    .withMessage('Reservation time is required')
    .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Reservation time must be in a 24-hour HH:MM format'),
  body('numberOfGuests')
    .notEmpty()
    .withMessage('Number of guests is required')
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of guests must be an integer between 1 and 20'),
  body('specialRequest')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters'),
  validateResult
];

/**
 * Validation chain for updating reservation status.
 */
const updateStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid reservation ID format'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'Confirmed', 'Cancelled', 'Completed'])
    .withMessage('Status must be one of: Pending, Confirmed, Cancelled, Completed'),
  validateResult
];

/**
 * Validation chain for assigning a table.
 */
const assignTableValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid reservation ID format'),
  body('tableNumber')
    .notEmpty()
    .withMessage('Table number is required')
    .isInt({ min: 1 })
    .withMessage('Table number must be an integer greater than or equal to 1'),
  validateResult
];

/**
 * Validation chain for checking standard Mongo ID parameters.
 */
const idParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid reservation ID format'),
  validateResult
];

module.exports = {
  createReservationValidator,
  updateStatusValidator,
  assignTableValidator,
  idParamValidator
};
