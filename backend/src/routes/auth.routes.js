const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validation.middleware');
const authenticateUser = require('../middlewares/auth.middleware');

const router = express.Router();

const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

router.post(
  '/signup',
  signupValidation,
  validateRequest,
  authController.register
);

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];
router.post(
  '/login',
  loginValidation,
  validateRequest,
  authController.login
);

router.get('/me', authenticateUser, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    userId: req.user.id,
  });
});

router.post(
  '/logout',
  authenticateUser,
  authController.logout
);
module.exports = router;