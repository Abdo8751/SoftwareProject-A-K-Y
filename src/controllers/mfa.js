const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled
    }
  });
};

// @desc    Setup MFA for user
// @route   POST /api/v1/auth/mfa/setup
// @access  Private
exports.setupMFA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check if MFA is already enabled
    if (user.mfaEnabled) {
      return next(new ErrorResponse('MFA is already enabled for this user', 400));
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `EventTicketing:${user.email}`
    });

    // Save secret to user
    user.mfaSecret = secret.base32;
    await user.save({ validateBeforeSave: false });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl
      }
    });
  } catch (err) {
    next(new ErrorResponse(err.message, 500));
  }
};

// @desc    Verify MFA token and enable MFA
// @route   POST /api/v1/auth/mfa/verify
// @access  Private
exports.verifyAndEnableMFA = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return next(new ErrorResponse('Please provide a token', 400));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.mfaSecret) {
      return next(new ErrorResponse('MFA has not been set up', 400));
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1 // Allow 30 seconds clock skew
    });

    if (!verified) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Enable MFA
    user.mfaEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'MFA enabled successfully'
    });
  } catch (err) {
    next(new ErrorResponse(err.message, 500));
  }
};

// @desc    Verify MFA token during login
// @route   POST /api/v1/auth/mfa/validate
// @access  Public
exports.validateMFA = async (req, res, next) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return next(new ErrorResponse('Please provide email and token', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    if (!user.mfaEnabled || !user.mfaSecret) {
      return next(new ErrorResponse('MFA is not enabled for this user', 400));
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1 // Allow 30 seconds clock skew
    });

    if (!verified) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Send response with token
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(new ErrorResponse(err.message, 500));
  }
};

// @desc    Disable MFA
// @route   POST /api/v1/auth/mfa/disable
// @access  Private
exports.disableMFA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.mfaEnabled) {
      return next(new ErrorResponse('MFA is not enabled for this user', 400));
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (err) {
    next(new ErrorResponse(err.message, 500));
  }
}; 