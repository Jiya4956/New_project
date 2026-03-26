const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// Submit feedback
router.post("/feedback", async (req, res) => {
  try {
    const feedback = new Feedback({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
    });

    await feedback.save();

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
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching feedback",
    });
  }
});

module.exports = router;