const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');
const path = require('path');

// Load .env variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

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

// Connect to MongoDB
connectDB();

// Init Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Route mounting
app.use('/api/v1', require('./src/routes/auth')); // handles /register, /login, /forgetPassword
app.use('/api/v1/users', require('./src/routes/users'));
app.use('/api/v1/events', require('./src/routes/events'));
app.use('/api/v1', require('./src/routes/bookings'));


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
