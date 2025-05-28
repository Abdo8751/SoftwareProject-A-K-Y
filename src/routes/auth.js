const express = require('express');
const {
  register,
  login,
  forgotPassword,
  resetPassword
} = require('../controllers/auth');
const {
  setupMFA,
  verifyAndEnableMFA,
  validateMFA,
  disableMFA
} = require('../controllers/mfa');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// MFA routes
router.post('/mfa/setup', protect, setupMFA);
router.post('/mfa/verify', protect, verifyAndEnableMFA);
router.post('/mfa/validate', validateMFA);
router.post('/mfa/disable', protect, disableMFA);

module.exports = router;