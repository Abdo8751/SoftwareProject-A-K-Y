const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Event = require('../models/Event');
const User = require('../models/User');

let token;
let eventId;

beforeAll(async () => {
  // Create a test user and get token
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'organizer'
  };

  const user = await User.create(userData);
  token = user.getSignedJwtToken();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Events API', () => {
  describe('GET /api/v1/events', () => {
    it('should get all events', async () => {
      const res = await request(app).get('/api/v1/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/events', () => {
    it('should create a new event', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        category: 'Conference',
        location: 'Test Location',
        venue: 'Test Venue',
        date: '2024-12-31',
        time: '14:00',
        price: 100,
        capacity: 100
      };

      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(eventData.title);
      
      eventId = res.body.data._id;
    });

    it('should not create event without authentication', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        category: 'Conference',
        location: 'Test Location',
        venue: 'Test Venue',
        date: '2024-12-31',
        time: '14:00',
        price: 100,
        capacity: 100
      };

      const res = await request(app)
        .post('/api/v1/events')
        .send(eventData);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/events/:id', () => {
    it('should get event by ID', async () => {
      const res = await request(app).get(`/api/v1/events/${eventId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(eventId);
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/events/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/events/:id', () => {
    it('should update event', async () => {
      const updateData = {
        title: 'Updated Test Event',
        price: 150
      };

      const res = await request(app)
        .put(`/api/v1/events/${eventId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(updateData.title);
      expect(res.body.data.price).toBe(updateData.price);
    });
  });

  describe('DELETE /api/v1/events/:id', () => {
    it('should delete event', async () => {
      const res = await request(app)
        .delete(`/api/v1/events/${eventId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify event is deleted
      const checkEvent = await Event.findById(eventId);
      expect(checkEvent).toBeNull();
    });
  });
}); 