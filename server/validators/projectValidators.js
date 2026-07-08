const { body, param, validationResult } = require('express-validator');

const CATEGORIES = ['AI', 'ML', 'IoT', 'Embedded', 'Robotics', 'Web', 'Mobile App', 'Other'];

const createProjectValidator = [
  body('title')
    .trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('overview')
    .trim().notEmpty().withMessage('Overview is required')
    .isLength({ max: 1000 }).withMessage('Overview cannot exceed 1000 characters'),
  body('techStack')
    .optional({ nullable: true })
    .isArray({ max: 10 }).withMessage('Tech stack must be an array of max 10 items'),
  body('techStack.*')
    .optional().isString().withMessage('Each tech stack item must be a string'),
  body('rolesNeeded')
    .optional({ nullable: true })
    .isArray({ max: 6 }).withMessage('Roles needed must be an array of max 6 items'),
  body('rolesNeeded.*.role')
    .optional({ nullable: true, checkFalsy: true })
    .isString().withMessage('Role name must be a string'),
  body('rolesNeeded.*.skills')
    .optional({ nullable: true })
    .isArray().withMessage('Skills must be an array'),
  body('commitment')
    .optional({ nullable: true })
    .isString().withMessage('Commitment must be a string'),
  body('benefits')
    .optional({ nullable: true }),
  body('contact').custom(value => {
    if (!value || typeof value !== 'object') {
      throw new Error('Contact must include an email or phone number');
    }
    if (!value.email && !value.phone) {
      throw new Error('At least one contact method (email or phone) is required');
    }
    return true;
  }),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`)
];

const updateProjectValidator = [
  body('title')
    .optional({ nullable: true })
    .trim().notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('overview')
    .optional({ nullable: true })
    .trim().notEmpty().withMessage('Overview cannot be empty')
    .isLength({ max: 1000 }).withMessage('Overview cannot exceed 1000 characters'),
  body('techStack')
    .optional({ nullable: true })
    .isArray({ max: 10 }).withMessage('Tech stack must be an array of max 10 items'),
  body('techStack.*')
    .optional().isString().withMessage('Each tech stack item must be a string'),
  body('rolesNeeded')
    .optional({ nullable: true })
    .isArray({ max: 6 }).withMessage('Roles needed must be an array of max 6 items'),
  body('rolesNeeded.*.role')
    .optional({ nullable: true, checkFalsy: true })
    .isString().withMessage('Role name must be a string'),
  body('rolesNeeded.*.skills')
    .optional({ nullable: true })
    .isArray().withMessage('Skills must be an array'),
  body('commitment')
    .optional({ nullable: true })
    .isString().withMessage('Commitment must be a string'),
  body('benefits')
    .optional({ nullable: true }),
  body('contact').optional({ nullable: true }).custom(value => {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'object') throw new Error('Contact must be an object');
      if (!value.email && !value.phone) {
        throw new Error('At least one contact method (email or phone) is required');
      }
    }
    return true;
  }),
  body('category')
    .optional({ nullable: true })
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`)
];

const getProjectValidator = [
  param('id').isMongoId().withMessage('Invalid project ID')
];

const deleteProjectValidator = [
  param('id').isMongoId().withMessage('Invalid project ID')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, details: errors.array() });
  }
  next();
};

module.exports = {
  createProjectValidator: [...createProjectValidator, validate],
  updateProjectValidator: [...updateProjectValidator, validate],
  getProjectValidator: [...getProjectValidator, validate],
  deleteProjectValidator: [...deleteProjectValidator, validate]
};
