# Event Ticketing System

A full-stack event ticketing system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication and authorization (Admin, Event Organizer, Standard User)
- Event creation and management
- Event booking and ticket management
- Event analytics and reporting
- User profile management
- Admin dashboard for user and event management

## TODO List (Priority Tasks)

### 🔴 Critical Issues to Fix
- [ ] Test and verify event listing functionality after data structure fix
- [ ] Complete registration flow and post-registration navigation
- [ ] Test booking system end-to-end
- [ ] Verify admin event approval system
- [ ] Fix any remaining authentication issues

### 🔵 Core Features to Implement
1. Booking System
   - [ ] Add multiple ticket selection
   - [ ] Implement booking confirmation emails
   - [ ] Add ticket PDF generation
   - [ ] Create booking cancellation system

2. Event Management
   - [ ] Add event image upload functionality
   - [ ] Implement event categories/tags
   - [ ] Add advanced search filters
   - [ ] Create event calendar view

3. User Experience
   - [ ] Add email notifications system
   - [ ] Implement real-time updates
   - [ ] Add toast notifications
   - [ ] Improve form validations
   - [ ] Add loading states

4. Analytics & Admin
   - [ ] Complete analytics dashboard for organizers
   - [ ] Add sales reports
   - [ ] Implement user activity tracking
   - [ ] Create admin statistics dashboard

### 🟡 Technical Improvements
1. Security
   - [ ] Add rate limiting
   - [ ] Implement input sanitization
   - [ ] Add CSRF protection
   - [ ] Configure security headers

2. Performance
   - [ ] Implement code splitting
   - [ ] Add image optimization
   - [ ] Set up caching strategy
   - [ ] Optimize API responses

### 🟢 Project Requirements
1. Documentation
   - [ ] Complete API documentation
   - [ ] Add detailed setup instructions
   - [ ] Create deployment guide
   - [ ] Write user manual

2. Team Workflow
   - [ ] Set up GitHub branches for individual contributions
   - [ ] Create integration guide for single laptop demo
   - [ ] Prepare 45-minute evaluation presentation
   - [ ] Add code comments and documentation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/event-ticketing-system.git
cd event-ticketing-system
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following variables:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
PORT=5000
NODE_ENV=development
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
FROM_EMAIL=your_from_email
FROM_NAME=Your App Name
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

This will start both the backend server and the React frontend application.

- Backend server will run on http://localhost:5000
- Frontend application will run on http://localhost:3000

## API Documentation

### Authentication Endpoints

- POST /api/v1/register - Register a new user
- POST /api/v1/login - Login user
- POST /api/v1/forgot-password - Request password reset
- POST /api/v1/reset-password - Reset password

### User Endpoints

- GET /api/v1/users/profile - Get user profile
- PUT /api/v1/users/profile - Update user profile

### Event Endpoints

- GET /api/v1/events - Get all events
- POST /api/v1/events - Create new event (Organizer only)
- GET /api/v1/events/:id - Get event details
- PUT /api/v1/events/:id - Update event (Organizer only)
- DELETE /api/v1/events/:id - Delete event (Organizer only)
- GET /api/v1/events/:id/analytics - Get event analytics (Organizer only)

### Booking Endpoints

- POST /api/v1/bookings - Create new booking
- GET /api/v1/bookings - Get user's bookings
- PUT /api/v1/bookings/:id/cancel - Cancel booking

### Admin Endpoints

- GET /api/v1/admin/users - Get all users
- PUT /api/v1/admin/users/:id/role - Update user role
- GET /api/v1/admin/events - Get all events
- PUT /api/v1/admin/events/:id/status - Update event status

## User Roles

1. Admin
   - Manage users
   - Approve/reject events
   - View all events and bookings

2. Event Organizer
   - Create and manage events
   - View event analytics
   - Update event details

3. Standard User
   - View and book events
   - Manage bookings
   - Update profile

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
