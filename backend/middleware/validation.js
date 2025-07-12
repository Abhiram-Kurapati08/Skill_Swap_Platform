const { body, param, query, validationResult } = require('express-validator');

// Middleware to check for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation rules for user registration
const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('availability')
    .isIn(['weekdays', 'weekends', 'evenings', 'flexible', 'not-available'])
    .withMessage('Invalid availability option'),
  handleValidationErrors
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('availability')
    .optional()
    .isIn(['weekdays', 'weekends', 'evenings', 'flexible', 'not-available'])
    .withMessage('Invalid availability option'),
  body('isProfilePublic')
    .optional()
    .isBoolean()
    .withMessage('isProfilePublic must be a boolean'),
  handleValidationErrors
];

// Validation rules for skill
const validateSkill = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Skill name must be between 2 and 50 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Skill description must be between 10 and 500 characters'),
  body('level')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid skill level'),
  handleValidationErrors
];

// Validation rules for swap request
const validateSwapRequest = [
  body('recipientId')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  body('requestedSkill')
    .isObject()
    .withMessage('Requested skill must be an object'),
  body('offeredSkill')
    .isObject()
    .withMessage('Offered skill must be an object'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  ...validateSkill.map(rule => body('requestedSkill.*').custom(rule)),
  ...validateSkill.map(rule => body('offeredSkill.*').custom(rule)),
  handleValidationErrors
];

// Validation rules for rating
const validateRating = [
  body('swapRequestId')
    .isMongoId()
    .withMessage('Invalid swap request ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  body('skillRated.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Skill name must be between 2 and 50 characters'),
  body('skillRated.level')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid skill level'),
  handleValidationErrors
];

// Validation rules for admin actions
const validateBanUser = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('banReason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Ban reason must be between 10 and 500 characters'),
  handleValidationErrors
];

// Validation rules for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Validation rules for MongoDB ObjectId
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateSkill,
  validateSwapRequest,
  validateRating,
  validateBanUser,
  validatePagination,
  validateObjectId,
  handleValidationErrors
}; 