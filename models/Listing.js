const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['sell', 'buy', 'exchange', 'rent'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: null,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  location: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    enum: ['new', 'like new', 'excellent', 'good', 'fair', 'poor', ''],
    default: '',
  },
  images: [{
    type: String,
  }],
  owner: {
    id: {
      type: String,
      required: true,
    },
    name: String,
    email: String,
    phone: String,
  },
  availability: {
    start: String,
    end: String,
  },
  exchangeDesired: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'inactive'],
    default: 'active',
  },
  category: {
    type: String,
    default: '',
  },
  tags: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for search
listingSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
