const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// Submit feedback
router.post("/feedback", async (req, res) => {
  try {
    const feedback = await prisma.feedback.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
        rating: req.body.rating || 5,
        subject: req.body.subject || 'General',
      },
    });

    res.status(200).json({
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error submitting feedback",
    });
  }
});

// Get all feedback
router.get("/feedback", async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(feedbacks.map(f => ({ ...f, _id: f.id })));
  } catch (error) {
    res.status(500).json({
      message: "Error fetching feedback",
    });
  }
});

module.exports = router;