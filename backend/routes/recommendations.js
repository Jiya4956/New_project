const express = require("express");
const router = express.Router();
const Scholarship = require("../models/Scholarship");

// AI recommendation logic
router.post("/recommend", async (req, res) => {
  try {
    const { course, marks, income, category } = req.body;

    const scholarships = await Scholarship.find();

    const recommendations = scholarships.filter((sch) => {
      let score = 0;

      if (sch.course === course) score += 2;
      if (marks >= sch.minimumMarks) score += 1;
      if (income <= sch.maxIncome) score += 1;
      if (sch.category === category || sch.category === "all") score += 1;

      return score >= 3; // recommended if score high
    });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Recommendation failed" });
  }
});

module.exports = router;