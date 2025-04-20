const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents,
  getEventAnalytics
} = require('../controllers/events');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEvent);

router.use(protect);

router.post('/', authorize('organizer'), createEvent);
router.put('/:id', authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', authorize('organizer', 'admin'), deleteEvent);

// Organizer-specific routes
router.get('/users/events', authorize('organizer'), getOrganizerEvents);
router.get('/users/events/analytics', authorize('organizer'), getEventAnalytics);

module.exports = router;