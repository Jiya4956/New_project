const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// One bookmark per user per scholarship
bookmarkSchema.index({ user: 1, scholarship: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
