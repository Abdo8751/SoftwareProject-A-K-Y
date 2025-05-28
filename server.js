const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error');
const securityMiddleware = require('./src/middleware/security');
const cors = require('cors');
const path = require('path');

// Load env vars
dotenv.config();

// Debug output
console.log('Current environment variables:');
console.log({
  MONGO_URI: process.env.MONGO_URI ? 'Exists' : 'MISSING',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

// Ensure MONGO_URI is defined
if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined');
  process.exit(1);
}

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply security middleware
app.use(securityMiddleware);

// Enable CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));

// Mount routers
app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1/users', require('./src/routes/users'));
app.use('/api/v1/events', require('./src/routes/events'));
app.use('/api/v1/bookings', require('./src/routes/bookings'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
