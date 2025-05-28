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

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/mfa/validate', validateMFA);

// Protected MFA routes
router.use('/mfa', protect);
router.post('/mfa/setup', setupMFA);
router.post('/mfa/verify', verifyAndEnableMFA);
router.post('/mfa/disable', disableMFA);

module.exports = router;