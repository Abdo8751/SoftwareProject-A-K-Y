const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'approved' }).populate('organizer', 'name email');
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all events (any status)
// @route   GET /api/v1/events/all
// @access  Private (Admin)
exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


// @desc    Create event
// @route   POST /api/v1/events
// @access  Private (Organizer)
exports.createEvent = async (req, res, next) => {
  try {
    req.body.organizer = req.user.id;
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private (Organizer or Admin)
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    // Make sure user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: `User ${req.user.id} is not authorized to update this event` 
      });
    }
    
    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update event status (approve/reject)
// @route   PUT /api/v1/events/:id/status
// @access  Private (Admin)
exports.updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['approved', 'pending', 'declined'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private (Organizer or Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    // Make sure user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: `User ${req.user.id} is not authorized to delete this event` 
      });
    }
    
    await event.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get organizer's events
// @route   GET /api/v1/users/events
// @access  Private (Organizer)
exports.getOrganizerEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user.id });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get event analytics
// @route   GET /api/v1/users/events/analytics
// @access  Private (Organizer)
exports.getEventAnalytics = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user.id });
    
    const analytics = await Promise.all(events.map(async event => {
      const bookings = await Booking.find({ event: event._id, isCancelled: false });
      const ticketsBooked = bookings.reduce((sum, booking) => sum + booking.tickets, 0);
      const percentageBooked = (ticketsBooked / event.totalTickets) * 100;
      
      return {
        eventId: event._id,
        eventTitle: event.title,
        totalTickets: event.totalTickets,
        ticketsBooked,
        percentageBooked: percentageBooked.toFixed(2)
      };
    }));
    
    res.status(200).json({ success: true, data: analytics });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};