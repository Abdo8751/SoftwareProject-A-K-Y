const mongoose = require('mongoose');
const slugify = require('slugify');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [50, 'Title cannot be more than 50 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Music',
      'Sports',
      'Arts',
      'Technology',
      'Business',
      'Food',
      'Education',
      'Other'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  venue: {
    type: String,
    required: [true, 'Please add a venue']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  time: {
    type: String,
    required: [true, 'Please add a time']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  totalTickets: {
    type: Number,
    required: [true, 'Please add number of tickets']
  },
  availableTickets: {
    type: Number,
    required: [true, 'Please add number of available tickets']
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: true
  },
  organizer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create event slug from the title
EventSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Reverse populate with virtuals
EventSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'event',
  justOne: false
});

// Index for text search
EventSchema.index({
  title: 'text',
  description: 'text',
  venue: 'text',
  category: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Event', EventSchema);