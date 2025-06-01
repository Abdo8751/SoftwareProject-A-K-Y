const Event = require('../models/Event');
const Booking = require('../models/Booking');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// This handles creating a new event
// Might need to validate date and time format later

// Double-check if organizer ID is being saved properly

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Event.find(JSON.parse(queryStr));

  // Search
  if (req.query.search) {
    query = Event.find({
      $text: {
        $search: req.query.search
      }
    });
  }

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-date');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Event.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Populate
  query = query.populate({
    path: 'organizer',
    select: 'name email'
  });

  // Executing query
  const events = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: events.length,
    pagination,
    data: events
  });
});

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate({
    path: 'organizer',
    select: 'name email'
  });

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: event
  });
});

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

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private
exports.createEvent = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.organizer = req.user.id;

  // Check for published event
  const publishedEvent = await Event.findOne({ organizer: req.user.id });

  // If the user is not an admin, they can only add one event
  if (publishedEvent && req.user.role !== 'admin') {
    return next(new ErrorResponse(`The user with ID ${req.user.id} has already published an event`, 400));
  }

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private
exports.updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is event organizer
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this event`, 401));
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: event
  });
});

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
// @access  Private
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is event organizer
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this event`, 401));
  }

  await event.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

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