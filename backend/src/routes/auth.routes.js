const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { handleUpload } = require('../middleware/multer');
const { validateRegistration, validateLogin } = require('../middleware/validator');
const auth = require('../middleware/auth');

// Test endpoint without file upload
router.post('/test-registration', (req, res) => {
  try {
    console.log('Test registration request received:', req.body);
    res.json({
      success: true,
      message: 'Test endpoint working',
      receivedData: req.body,
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Test endpoint error',
    });
  }
});

// Auth Routes
router.post('/register-salon-owner', function(req, res, next) {
  handleUpload(req, res, function(err) {
    if (err) return next(err);
    validateRegistration(req, res, function(err) {
      if (err) return next(err);
      authController.registerSalonOwner(req, res, next);
    });
  });
});

router.post('/register-customer', function(req, res, next) {
  validateRegistration(req, res, function(err) {
    if (err) return next(err);
    authController.registerCustomer(req, res, next);
  });
});

router.post('/login', function(req, res, next) {
  validateLogin(req, res, function(err) {
    if (err) return next(err);
    authController.login(req, res, next);
  });
});

// Google OAuth: verify ID token from client and issue our JWT
router.post('/google', authController.googleLogin);

router.post('/logout', function(req, res, next) {
  auth(req, res, function(err) {
    if (err) return next(err);
    authController.logout(req, res, next);
  });
});

// Profile Routes
router.get('/profile', function(req, res, next) {
  auth(req, res, function(err) {
    if (err) return next(err);
    authController.getProfile(req, res, next);
  });
});

router.put('/profile', function(req, res, next) {
  auth(req, res, function(err) {
    if (err) return next(err);
    validateRegistration(req, res, function(err) {
      if (err) return next(err);
      authController.updateProfile(req, res, next);
    });
  });
});

// Password Routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Verification Routes
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

module.exports = router;
