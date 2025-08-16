const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { handleUpload } = require('../middleware/multer');

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

// Register salon owner (expects multipart/form-data with logo + license)
router.post('/register-salon-owner', handleUpload, authController.registerSalonOwner);

// Login
router.post('/login', authController.login);

module.exports = router;
