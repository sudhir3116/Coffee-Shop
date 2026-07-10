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
 * Validation rules for creating a new menu item.
 */
const createMenuValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Menu item name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu item name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Coffee', 'Tea', 'Dessert', 'Snacks', 'Combo', 'Cold Beverage'])
    .withMessage('Invalid category. Must be one of: Coffee, Tea, Dessert, Snacks, Combo, Cold Beverage'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Image path/URL is required'),
  body('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array of strings'),
  body('ingredients.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Ingredient text cannot be empty'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  validateResult
];

/**
 * Validation rules for updating a menu item.
 */
const updateMenuValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid menu item ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu item name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .optional()
    .trim()
    .isIn(['Coffee', 'Tea', 'Dessert', 'Snacks', 'Combo', 'Cold Beverage'])
    .withMessage('Invalid category. Must be one of: Coffee, Tea, Dessert, Snacks, Combo, Cold Beverage'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
  body('image')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Image path/URL cannot be empty'),
  body('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array of strings'),
  body('ingredients.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Ingredient text cannot be empty'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  validateResult
];

/**
 * Validation rules for toggling availability.
 */
const updateAvailabilityValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid menu item ID format'),
  body('isAvailable')
    .notEmpty()
    .withMessage('isAvailable is required')
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  validateResult
];

/**
 * Validation rules for toggling featured status.
 */
const updateFeaturedValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid menu item ID format'),
  body('isFeatured')
    .notEmpty()
    .withMessage('isFeatured is required')
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  validateResult
];

/**
 * Validation rules for verifying MongoDB ID in URL parameters.
 */
const idParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid menu item ID format'),
  validateResult
];

module.exports = {
  createMenuValidator,
  updateMenuValidator,
  updateAvailabilityValidator,
  updateFeaturedValidator,
  idParamValidator
};
