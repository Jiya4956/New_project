const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const email = require('../lib/emailService');
const { getAdmins } = require('../lib/notificationService');
const { protect, authorize } = require('../middleware/auth');

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

    // Email notifications (non-blocking)
    email.sendFeedbackSubmitted(
      { name: feedback.name, email: feedback.email },
      feedback
    );
    getAdmins().then((admins) => {
      admins.forEach((admin) => {
        email.sendAdminFeedbackAlert(admin.email, feedback);
      });
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
router.get("/feedback", protect, authorize('admin'), async (req, res) => {
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