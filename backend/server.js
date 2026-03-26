const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());
require('./config/passport')(passport);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api', require('./routes/feedbackroutes'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/forum', require('./routes/forum'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Scholar Connect API is running (PostgreSQL + Prisma)' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server (no mongoose needed)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Database: NeonDB PostgreSQL (Prisma)`);
});

module.exports = app;
