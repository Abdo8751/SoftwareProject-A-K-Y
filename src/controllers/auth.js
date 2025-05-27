const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Register user
// @route   POST /api/v1/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const user = await User.create({ name, email, password, role });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide an email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  sendTokenResponse(user, 200, res);
};

// @desc    Forget password
// @route   POST /api/v1/forgetPassword
// @access  Public
exports.forgetPassword = async (req, res, next) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide email and new password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
};

// 🔐 Token sender
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
``