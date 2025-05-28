const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Setup MFA for user
// @route   POST /api/v1/auth/mfa/setup
// @access  Private
exports.setupMFA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

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
    next(err);
  }
};

// @desc    Verify MFA token and enable MFA
// @route   POST /api/v1/auth/mfa/verify
// @access  Private
exports.verifyAndEnableMFA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token
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
    next(err);
  }
};

// @desc    Verify MFA token during login
// @route   POST /api/v1/auth/mfa/validate
// @access  Public
exports.validateMFA = async (req, res, next) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Send response with token
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Disable MFA
// @route   POST /api/v1/auth/mfa/disable
// @access  Private
exports.disableMFA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (err) {
    next(err);
  }
}; 