const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  listingId: {
    type: String,
    required: true,
  },
  from: {
    id: String,
    name: String,
    email: String,
  },
  price: {
    type: Number,
    default: null,
  },
  message: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Offer', offerSchema);
