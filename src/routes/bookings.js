const express = require('express');
const {
  createBooking,
  getUserBookings,
  getBooking,
  cancelBooking
} = require('../controllers/bookings');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ✅ Only use protect
router.use(protect);

// ✅ Routes
router.post('/bookings', createBooking);
router.get('/my-bookings', getUserBookings);
router.get('/bookings/:id', getBooking);
router.delete('/bookings/:id', cancelBooking);

module.exports = router;
