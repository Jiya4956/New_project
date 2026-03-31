const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

const mapCategoryToEnum = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  const categoryMap = {
    "need-based": "Need_Based",
    need_based: "Need_Based",
    need: "Need_Based",
    "merit-based": "Merit_Based",
    merit_based: "Merit_Based",
    merit: "Merit_Based",
    international: "International",
    government: "Government",
    private: "Private",
    academic: "Academic",
    other: "Other",
  };
  return categoryMap[normalized] || null;
};

// AI recommendation logic
router.post("/recommend", async (req, res) => {
  try {
    const { course, marks, income, category } = req.body;

    const normalizedCourse = (course || "").trim().toLowerCase();
    const parsedMarks = Number.parseFloat(marks);
    const categoryEnum = mapCategoryToEnum(category);

    const where = {
      isActive: true,
      deadline: { gte: new Date() },
      ...(categoryEnum ? { category: categoryEnum } : {}),
    };

    const scholarships = await prisma.scholarship.findMany({
      where,
      orderBy: [{ deadline: "asc" }, { amount: "desc" }],
      take: 200,
    });

    const scored = scholarships
      .map((sch) => {
        let score = 0;
        const title = (sch.title || "").toLowerCase();
        const description = (sch.description || "").toLowerCase();
        const categoryText = String(sch.category || "").toLowerCase();
        const eligibility = sch.eligibility || {};

        if (categoryEnum && sch.category === categoryEnum) {
          score += 3;
        } else if (!category || category === "all") {
          score += 1;
        }

        if (normalizedCourse) {
          if (title.includes(normalizedCourse)) score += 3;
          if (description.includes(normalizedCourse)) score += 2;
        }

        const eligibilityText = JSON.stringify(eligibility).toLowerCase();
        if (normalizedCourse && eligibilityText.includes(normalizedCourse)) {
          score += 1;
        }

        if (Number.isFinite(parsedMarks)) {
          const gpaMin = Number.parseFloat(eligibility.gpaMin);
          const marksMin = Number.parseFloat(eligibility.marksMin);

          if (Number.isFinite(marksMin)) {
            if (parsedMarks >= marksMin) score += 2;
            else score -= 2;
          }
          if (Number.isFinite(gpaMin)) {
            if (parsedMarks >= gpaMin * 25) score += 1;
            else score -= 1;
          }
          if (!Number.isFinite(marksMin) && !Number.isFinite(gpaMin)) {
            score += 1;
          }
        }

        if (income) {
          const incomeToken = String(income).toLowerCase();
          if (eligibilityText.includes(incomeToken) || categoryText.includes("need")) {
            score += 1;
          }
        }

        return { ...sch, score };
      })
      .filter((sch) => sch.score >= 2)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.deadline) - new Date(b.deadline);
      })
      .slice(0, 24);

    // Map for frontend compat
    const mapped = scored.map((s) => ({ ...s, _id: s.id }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Recommendation failed" });
  }
});

module.exports = router;