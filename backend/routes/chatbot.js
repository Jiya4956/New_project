const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { message } = req.body;
  const text = message.toLowerCase();

  let response = "I'm here to help with scholarships.";

  if (text.includes("hello") || text.includes("hi")) {
    response = "Hello! How can I help you with scholarships?";
  }

  if (text.includes("apply")) {
    response = "You can apply by opening the scholarship and clicking Apply.";
  }

  if (text.includes("documents")) {
    response = "Documents usually include marksheets, income certificate and ID proof.";
  }

  res.json({ response });
});

module.exports = router;