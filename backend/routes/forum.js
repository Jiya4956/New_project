const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

router.get('/',                 forumController.getPosts);       // public listing
router.post('/',                protect, forumController.createPost);
router.post('/:id/upvote',      protect, forumController.upvotePost);
router.post('/:id/comment',     protect, forumController.addComment);
router.delete('/:id',           protect, forumController.deletePost);

module.exports = router;
