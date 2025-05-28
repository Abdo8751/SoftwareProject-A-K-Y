const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Event = require('../models/Event');
const User = require('../models/User');
const Booking = require('../models/Booking');

let token;
let eventId;
let bookingId;

beforeAll(async () => {
  // Create a test user and get token
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  };

  const user = await User.create(userData);
  token = user.getSignedJwtToken();

  // Create a test event
  const eventData = {
    title: 'Test Event',
    description: 'Test Description',
    category: 'Conference',
    location: 'Test Location',
    venue: 'Test Venue',
    date: '2024-12-31',
    time: '14:00',
    price: 100,
    capacity: 100,
    organizer: user._id
  };

  const event = await Event.create(eventData);
  eventId = event._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Bookings API', () => {
  describe('POST /api/v1/events/:eventId/bookings', () => {
    it('should create a new booking', async () => {
      const bookingData = {
        ticketQuantity: 2
      };

      const res = await request(app)
        .post(`/api/v1/events/${eventId}/bookings`)
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticketQuantity).toBe(bookingData.ticketQuantity);
      
      bookingId = res.body.data._id;

      // Verify available tickets were updated
      const event = await Event.findById(eventId);
      expect(event.availableTickets).toBe(98); // 100 - 2
    });

    it('should not create booking without authentication', async () => {
      const bookingData = {
        ticketQuantity: 2
      };

      const res = await request(app)
        .post(`/api/v1/events/${eventId}/bookings`)
        .send(bookingData);

      expect(res.status).toBe(401);
    });

    it('should not create booking with invalid ticket quantity', async () => {
      const bookingData = {
        ticketQuantity: 101 // More than available
      };

      const res = await request(app)
        .post(`/api/v1/events/${eventId}/bookings`)
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('should get user bookings', async () => {
      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/bookings/:id', () => {
    it('should get booking by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(bookingId);
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/bookings/:id', () => {
    it('should cancel booking and return tickets', async () => {
      const res = await request(app)
        .delete(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify booking is deleted
      const checkBooking = await Booking.findById(bookingId);
      expect(checkBooking).toBeNull();

      // Verify tickets were returned to event
      const event = await Event.findById(eventId);
      expect(event.availableTickets).toBe(100); // Back to original capacity
    });
  });
}); 