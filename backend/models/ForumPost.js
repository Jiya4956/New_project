const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: 5000,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tag: {
    type: String,
    enum: ['General', 'Eligibility', 'Application', 'Documents', 'International', 'Government', 'BTech', 'MBA', 'Medicine', 'Tips'],
    default: 'General',
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ForumPost', forumPostSchema);
