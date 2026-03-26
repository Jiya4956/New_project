const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a scholarship title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  provider: {
    type: String,
    required: [true, 'Please provide a provider name'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Academic', 'Need-Based', 'Merit-Based', 'International', 'Government', 'Private', 'Other'],
  },
  country: {
    type: String,
    required: [true, 'Please provide a country'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide scholarship amount'],
  },
  currency: {
    type: String,
    default: 'USD',
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide a deadline'],
  },
  eligibility: {
    ageMin: Number,
    ageMax: Number,
    educationLevel: {
      type: String,
      enum: ['High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Any'],
      default: 'Any',
    },
    gpaMin: Number,
    requirements: [String],
  },
  applicationProcess: {
    type: String,
    default: 'Submit application form with required documents',
  },
  documents: [String],
  website: String,
  contactEmail: String,
  contactPhone: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
scholarshipSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);

