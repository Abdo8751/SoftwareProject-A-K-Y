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
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

router.use(authorize('admin'));
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;