const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  documents: [
    {
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  personalInfo: {
    phone: String,
    address: String,
    country: String,
    dateOfBirth: Date,
    education: {
      currentLevel: String,
      university: String,
      gpa: Number,
      major: String,
    },
  },
  applicationLetter: String,
  reviewNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
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
applicationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create unique index to prevent duplicate applications
applicationSchema.index({ scholarship: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

