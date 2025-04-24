require('dotenv').config();  // Load environment variables

const mongoose = require('mongoose');

// Use the URL from the .env file
const mongoUrl ='mongodb://localhost:27017/voting';

// Connect to MongoDB using mongoose
mongoose.connect(mongoUrl);

// Get the MongoDB connection instance
const db = mongoose.connection;

// Handle successful connection
db.on('connected', () => {
  console.log('MongoDB connected');
});

// Handle connection errors
db.on('error', (err) => {
  console.log('Error occurred while connecting to DB', err);
});

// Handle disconnection
db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = db;
