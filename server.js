const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');
const path = require('path');

// Enhanced env loading
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Debug environment
console.log('Current environment variables:');
console.log({
  MONGO_URI: process.env.MONGO_URI ? 'Exists' : 'MISSING',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

// Validate critical env vars
if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined');
  console.error('Current working directory:', process.cwd());
  console.error('Resolved .env path:', path.resolve(__dirname, '.env'));
  process.exit(1);
}

// Connect to database
connectDB();

// Initialize express
const app = express();


// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Mount routers - UPDATED PATHS
app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1/users', require('./src/routes/users'));
app.use('/api/v1/events', require('./src/routes/events'));
app.use('/api/v1/bookings', require('./src/routes/bookings'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

