const express = require('express');
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