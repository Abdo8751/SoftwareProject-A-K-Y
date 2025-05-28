const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents,
  getEventAnalytics,
  getAllEvents,
  updateEventStatus
} = require('../controllers/events');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ✅ Public routes
router.get('/', getEvents);
router.get('/all', protect, authorize('admin'), getAllEvents); // ⬅️ Moved above :id
router.get('/:id', getEvent); // ⬅️ Now safe

// ✅ Protected routes
router.use(protect);

router.post('/', authorize('organizer', 'admin'), createEvent);
router.put('/:id', authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', authorize('organizer', 'admin'), deleteEvent);

// ✅ Organizer-specific routes
router.get('/organizer/events', authorize('organizer'), getOrganizerEvents);
router.get('/organizer/events/analytics', authorize('organizer'), getEventAnalytics);

// ✅ Admin route
router.put('/:id/status', authorize('admin'), updateEventStatus);
// Routes for all event-related operations
// Protected routes below require the user to be an organizer



module.exports = router;
