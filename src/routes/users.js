const express = require('express');
// User-related routes will be here yes
// Added auth middleware to protect some of them
// Might wanna double-check if admin access is working properly

const {
  getUsers,
  getUser,
  getUserProfile,
  updateUserProfile,
  updateUserRole,
  deleteUser
} = require('../controllers/users');
const { login, forgotPassword } = require('../controllers/auth');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Protected routes (authentication required)
router.use(protect);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUser);
router.put('/:id/role', authorize('admin'), updateUserRole);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;