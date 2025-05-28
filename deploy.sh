#!/bin/bash

# Build the client
echo "Building client..."
cd client
npm run build
cd ..

# Install dependencies
echo "Installing dependencies..."
npm install

# Set environment variables
echo "Setting environment variables..."
export NODE_ENV=production

# Start the server
echo "Starting server..."
npm start 