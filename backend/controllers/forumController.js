const prisma = require('../lib/prisma');
const email  = require('../lib/emailService');
const { createNotification } = require('../lib/notificationService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// GET /api/forum
exports.getPosts = async (req, res) => {
  try {
    const { tag } = req.query;
    const where = tag ? { tag } : {};

    const posts = await prisma.forumPost.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
        upvotedBy: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const mapped = posts.map(p => ({
      ...p,
      _id: p.id,
      author: p.author ? { ...p.author, _id: p.author.id } : null,
      comments: p.comments.map(c => ({
        ...c,
        _id: c.id,
        author: c.author ? { ...c.author, _id: c.author.id } : null,
      })),
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/forum
exports.createPost = async (req, res) => {
  try {
    const { title, content, tag } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        tag: tag || 'General',
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        comments: true,
      },
    });

    res.status(201).json({
      ...post,
      _id: post.id,
      author: { ...post.author, _id: post.author.id },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/forum/:id/upvote
exports.upvotePost = async (req, res) => {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: req.params.id },
      include: {
        upvotedBy: { select: { id: true } },
        author: { select: { id: true, name: true, email: true } },
      },
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyUpvoted = post.upvotedBy.some(u => u.id === req.user.id);

    if (alreadyUpvoted) {
      await prisma.forumPost.update({
        where: { id: req.params.id },
        data: {
          upvotes:    { decrement: 1 },
          upvotedBy:  { disconnect: { id: req.user.id } },
        },
      });
      res.json({ upvotes: Math.max(0, post.upvotes - 1) });
    } else {
      await prisma.forumPost.update({
        where: { id: req.params.id },
        data: {
          upvotes:   { increment: 1 },
          upvotedBy: { connect: { id: req.user.id } },
        },
      });
      res.json({ upvotes: post.upvotes + 1 });

      // Notify post author (not self)
      if (post.author && post.author.id !== req.user.id) {
        const actorName = req.user.name || 'Someone';
        createNotification({
          userId:  post.author.id,
          type:    'forum_upvote',
          title:   '👍 Your post got an upvote!',
          message: `${actorName} upvoted your post "${post.title}".`,
          link:    `${FRONTEND_URL}/forum`,
        });
        email.sendForumActivity(post.author, post, actorName, 'upvote');
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/forum/:id/comment
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Comment content required' });

    const post = await prisma.forumPost.findUnique({
      where: { id: req.params.id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await prisma.forumComment.create({
      data: {
        content,
        authorId: req.user.id,
        postId: req.params.id,
      },
    });

    // Fetch all comments
    const comments = await prisma.forumComment.findMany({
      where: { postId: req.params.id },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const mapped = comments.map(c => ({
      ...c,
      _id: c.id,
      author: c.author ? { ...c.author, _id: c.author.id } : null,
    }));

    res.json({ comments: mapped });

    // Notify post author (not self)
    if (post.author && post.author.id !== req.user.id) {
      const actorName = req.user.name || 'Someone';
      createNotification({
        userId:  post.author.id,
        type:    'forum_comment',
        title:   '💬 New Comment on Your Post',
        message: `${actorName} commented on "${post.title}".`,
        link:    `${FRONTEND_URL}/forum`,
      });
      email.sendForumActivity(post.author, post, actorName, 'comment');
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/forum/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await prisma.forumPost.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.forumPost.delete({ where: { id: req.params.id } });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
