const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'applications');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF, JPG, and PNG files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post('/', protect, applicationController.applyForScholarship);
router.post(
  '/upload-document',
  protect,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Max size is 10MB.' });
      }
      return res.status(400).json({ message: err.message || 'File upload failed' });
    });
  },
  applicationController.uploadApplicationDocument
);
router.get('/my-applications', protect, applicationController.getMyApplications);
router.get('/my', protect, applicationController.getMyApplications);  // alias
router.get('/:id', protect, applicationController.getApplicationById);
router.get('/', protect, authorize('admin'), applicationController.getAllApplications);
router.put('/:id/status', protect, authorize('admin'), applicationController.updateApplicationStatus);

module.exports = router;

