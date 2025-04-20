const express = require('express');
const {
  createBooking,
  getUserBookings,
  getBooking,
  cancelBooking
} = require('../controllers/bookings');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('user'), createBooking);
router.get('/users/bookings', authorize('user'), getUserBookings);
router.get('/:id', authorize('user'), getBooking);
router.delete('/:id', authorize('user'), cancelBooking);

module.exports = router;