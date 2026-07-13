const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Residential', 'Commercial'],
    required: true,
  },
  adType: {
    type: String,
    enum: ['Rent', 'Sale'],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    default: [],
  },
  contactNo: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  additionalDetails: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Not Available'],
    default: 'Available',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', PropertySchema);
