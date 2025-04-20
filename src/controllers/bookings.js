const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Create booking
// @route   POST /api/v1/bookings
// @access  Private (User)
exports.createBooking = async (req, res, next) => {
  try {
    const event = await Event.findById(req.body.event);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    if (event.status !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot book tickets for an unapproved event' 
      });
    }
    
    if (event.availableTickets < req.body.tickets) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not enough tickets available' 
      });
    }
    
    const totalPrice = event.price * req.body.tickets;
    
    const booking = await Booking.create({
      event: req.body.event,
      user: req.user.id,
      tickets: req.body.tickets,
      totalPrice
    });
    
    // Update available tickets
    event.availableTickets -= req.body.tickets;
    await event.save();
    
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/v1/users/bookings
// @access  Private (User)
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('event', 'title date location');
      
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private (User)
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date location')
      .populate('user', 'name email');
      
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Make sure user is booking owner
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: `User ${req.user.id} is not authorized to access this booking` 
      });
    }
    
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private (User)
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Make sure user is booking owner
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: `User ${req.user.id} is not authorized to cancel this booking` 
      });
    }
    
    if (booking.isCancelled) {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking is already cancelled' 
      });
    }
    
    // Update event's available tickets
    const event = await Event.findById(booking.event);
    event.availableTickets += booking.tickets;
    await event.save();
    
    // Mark booking as cancelled
    booking.isCancelled = true;
    await booking.save();
    
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};