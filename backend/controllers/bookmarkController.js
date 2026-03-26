const prisma = require('../lib/prisma');

// GET /api/bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        scholarship: {
          select: {
            id: true, title: true, provider: true, amount: true,
            currency: true, country: true, category: true, deadline: true, isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = bookmarks.map(b => ({
      ...b,
      _id: b.id,
      scholarship: b.scholarship ? { ...b.scholarship, _id: b.scholarship.id } : null,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookmarks
exports.addBookmark = async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    if (!scholarshipId) return res.status(400).json({ message: 'scholarshipId is required' });

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: req.user.id,
        scholarshipId,
      },
      include: {
        scholarship: {
          select: { id: true, title: true, provider: true, amount: true, currency: true, country: true, category: true, deadline: true },
        },
      },
    });

    res.status(201).json({
      ...bookmark,
      _id: bookmark.id,
      scholarship: { ...bookmark.scholarship, _id: bookmark.scholarship.id },
    });
  } catch (err) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Already bookmarked' });
    }
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/bookmarks/:scholarshipId
exports.removeBookmark = async (req, res) => {
  try {
    await prisma.bookmark.delete({
      where: {
        userId_scholarshipId: {
          userId: req.user.id,
          scholarshipId: req.params.scholarshipId,
        },
      },
    });
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Bookmark not found' });
    }
    res.status(500).json({ message: err.message });
  }
};
