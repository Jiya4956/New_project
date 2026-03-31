const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const path = require('path');

dotenv.config();

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  'http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function isAllowedOrigin(origin) {
  if (!origin) return true
  if (allowedOrigins.includes(origin)) return true

  // Support Vercel preview/prod domains without listing every preview URL
  if (origin.endsWith('.vercel.app')) return true

  return false
}

// Middleware
app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests (curl, server-to-server, health checks)
    if (isAllowedOrigin(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/notifications', require('./routes/notifications'));

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
  const r2Enabled = Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Database: NeonDB PostgreSQL (Prisma)`);
  console.log(`☁️ R2 Uploads: ${r2Enabled ? 'ENABLED' : 'DISABLED'}`);
  if (r2Enabled) {
    console.log(`🪣 R2 Bucket: ${process.env.R2_BUCKET_NAME}`);
    console.log(`🔗 R2 Base URL: ${process.env.R2_PUBLIC_BASE_URL || '(not set)'}`);
  }
});

module.exports = app;
