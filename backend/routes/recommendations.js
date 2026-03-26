const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// AI recommendation logic
router.post("/recommend", async (req, res) => {
  try {
    const { course, marks, income, category } = req.body;

    const scholarships = await prisma.scholarship.findMany({
      where: { isActive: true },
    });

    const recommendations = scholarships.filter((sch) => {
      let score = 0;

      // Check category match
      if (category && sch.category === category) score += 2;

      // Check country/course relevance (basic keyword matching)
      if (course && sch.title.toLowerCase().includes(course.toLowerCase())) score += 1;
      if (course && sch.description && sch.description.toLowerCase().includes(course.toLowerCase())) score += 1;

      // Check eligibility GPA
      const elig = sch.eligibility || {};
      if (marks && elig.gpaMin && parseFloat(marks) >= elig.gpaMin * 25) score += 1;
      if (!elig.gpaMin) score += 1; // No min = everyone qualifies

      // Category bonus
      if (!category || sch.category === category || category === 'all') score += 1;

      return score >= 2;
    });

    // Map for frontend compat
    const mapped = recommendations.map(s => ({ ...s, _id: s.id }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Recommendation failed" });
  }
});

module.exports = router;