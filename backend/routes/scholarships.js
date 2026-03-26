const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', scholarshipController.getAllScholarships);
router.get('/:id', scholarshipController.getScholarshipById);
router.post('/', protect, authorize('admin'), scholarshipController.createScholarship);
router.put('/:id', protect, authorize('admin'), scholarshipController.updateScholarship);
router.delete('/:id', protect, authorize('admin'), scholarshipController.deleteScholarship);

module.exports = router;

