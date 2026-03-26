const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.get('/',                protect, bookmarkController.getBookmarks);
router.post('/',               protect, bookmarkController.addBookmark);
router.delete('/:scholarshipId', protect, bookmarkController.removeBookmark);

module.exports = router;
