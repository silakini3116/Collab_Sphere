const { body, validationResult } = require('express-validator');

const createRequestValidator = [
  body('note').isString().trim().notEmpty().withMessage('Note is required').isLength({ min: 1, max: 300 }).withMessage('Note must be between 1 and 300 characters')
];

const respondRequestValidator = [
  body('status').isIn(['accepted', 'rejected']).withMessage('Status must be accepted or rejected')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, details: errors.array() });
  }
  next();
};

module.exports = {
  createRequestValidator: [...createRequestValidator, validate],
  respondRequestValidator: [...respondRequestValidator, validate]
};
