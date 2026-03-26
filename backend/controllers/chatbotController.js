const prisma = require('../lib/prisma');

// Rule-based chatbot responses
const getChatbotResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  const responses = {
    eligibility: [
      "Eligibility requirements vary by scholarship. Common requirements include GPA, academic level, nationality, and specific documents.",
      "Check the scholarship details page for specific eligibility criteria including age limits, education level, and minimum GPA requirements.",
    ],
    application: [
      "To apply, select a scholarship and click 'Apply Now'. Fill out the application form and upload required documents.",
      "After applying, you can track your application status in the 'My Applications' section.",
    ],
    deadline: [
      "Deadlines are clearly displayed on each scholarship listing. Make sure to apply before the deadline.",
      "We recommend applying at least 2 weeks before the deadline to ensure all documents are submitted.",
    ],
    documents: [
      "Required documents typically include transcripts, recommendation letters, personal statement, and proof of identity.",
      "Each scholarship lists its specific document requirements. Check the scholarship details for a complete list.",
    ],
    amount: [
      "Scholarship amounts vary significantly depending on the program. Check individual scholarship listings for specific amounts.",
      "Amounts are displayed in the scholarship listing with the currency specified.",
    ],
    general: [
      "I'm here to help with scholarship-related questions. You can browse scholarships, filter by category or country, and apply directly.",
      "Feel free to ask about eligibility, applications, deadlines, or any other scholarship-related questions.",
    ],
  };

  if (lowerMessage.includes('eligibility') || lowerMessage.includes('eligible') || lowerMessage.includes('qualify')) {
    return responses.eligibility[Math.floor(Math.random() * responses.eligibility.length)];
  }
  if (lowerMessage.includes('apply') || lowerMessage.includes('application') || lowerMessage.includes('submit')) {
    return responses.application[Math.floor(Math.random() * responses.application.length)];
  }
  if (lowerMessage.includes('deadline') || lowerMessage.includes('due') || lowerMessage.includes('date')) {
    return responses.deadline[Math.floor(Math.random() * responses.deadline.length)];
  }
  if (lowerMessage.includes('document') || lowerMessage.includes('upload') || lowerMessage.includes('file')) {
    return responses.documents[Math.floor(Math.random() * responses.documents.length)];
  }
  if (lowerMessage.includes('amount') || lowerMessage.includes('money') || lowerMessage.includes('fund')) {
    return responses.amount[Math.floor(Math.random() * responses.amount.length)];
  }

  return responses.general[Math.floor(Math.random() * responses.general.length)];
};

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Please provide a message' });
    }

    const response = getChatbotResponse(message);

    // Save message history
    await prisma.message.create({
      data: {
        userId: req.user ? req.user.id : null,
        message,
        response,
        category: 'general',
      },
    });

    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessageHistory = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json(messages.map(m => ({ ...m, _id: m.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
