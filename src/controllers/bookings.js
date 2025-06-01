const Booking = require('../models/Booking');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const emailService = require('../utils/emailService');
const pdfGenerator = require('../utils/pdfGenerator');
const fs = require('fs').promises;

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @route   GET /api/v1/events/:eventId/bookings
// @access  Private
exports.getBookings = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.eventId) {
    query = Booking.find({ event: req.params.eventId });
  } else {
    query = Booking.find().populate({
      path: 'event',
      select: 'title date time venue'
    });
  }

  // For regular users, show only their bookings
  if (req.user.role !== 'admin') {
    query = query.find({ user: req.user.id });
  }

  const bookings = await query;

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate({
    path: 'event',
    select: 'title date time venue price'
  });

  if (!booking) {
    return next(new ErrorResponse(`No booking found with id of ${req.params.id}`, 404));
  }

  // Make sure user is booking owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this booking', 401));
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.body.event);

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.body.event}`, 404));
  }

  // Check if event has enough tickets available
  if (event.availableTickets < req.body.ticketQuantity) {
    return next(new ErrorResponse(`Not enough tickets available`, 400));
  }

  // Calculate total price
  const totalPrice = event.price * req.body.ticketQuantity;

  // Create booking
  const booking = await Booking.create({
    event: req.body.event,
    user: req.user.id,
    ticketQuantity: req.body.ticketQuantity,
    totalPrice
  });

  // Update available tickets
  await Event.findByIdAndUpdate(req.body.event, {
    $inc: { availableTickets: -req.body.ticketQuantity }
  });

  // Populate event details for email
  await booking.populate({
    path: 'event',
    select: 'title venue date price'
  });

  // Send confirmation email
  await emailService.sendBookingConfirmation(booking);

  // Generate PDF ticket
  const ticketPath = await pdfGenerator.generateTicket(booking);

  // Read the PDF file
  const ticketBuffer = await fs.readFile(ticketPath);

  // Delete the temporary file
  await fs.unlink(ticketPath);

  res.status(201).json({
    success: true,
    data: booking,
    ticket: ticketBuffer.toString('base64')
  });
});

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id
// @access  Private/Admin
exports.updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new ErrorResponse(`No booking found with id of ${req.params.id}`, 404));
  }

  // Make sure user is booking owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this booking', 401));
  }

  // Only allow status updates
  if (req.body.status) {
    booking.status = req.body.status;
    await booking.save();
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns booking
  if (booking.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to cancel this booking`, 401));
  }

  // Check if booking is already cancelled
  if (booking.status === 'cancelled') {
    return next(new ErrorResponse(`Booking is already cancelled`, 400));
  }

  // Check if event date has passed
  const event = await Event.findById(booking.event);
  if (new Date(event.date) < new Date()) {
    return next(new ErrorResponse(`Cannot cancel booking for past event`, 400));
  }

  // Update booking status
  booking.status = 'cancelled';
  await booking.save();

  // Return tickets to event
  event.availableTickets += booking.ticketQuantity;
  await event.save();

  // Send cancellation email
  await emailService.sendBookingCancellation(booking);

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private/Admin
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new ErrorResponse(`No booking found with id of ${req.params.id}`, 404));
  }

  // Make sure user is booking owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this booking', 401));
  }

  await booking.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});