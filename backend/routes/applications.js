const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, applicationController.applyForScholarship);
router.get('/my-applications', protect, applicationController.getMyApplications);
router.get('/my', protect, applicationController.getMyApplications);  // alias
router.get('/:id', protect, applicationController.getApplicationById);
router.get('/', protect, authorize('admin'), applicationController.getAllApplications);
router.put('/:id/status', protect, authorize('admin'), applicationController.updateApplicationStatus);

module.exports = router;

