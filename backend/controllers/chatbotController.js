const Message = require('../models/Message');

// Rule-based chatbot responses
const getChatbotResponse = (message, user) => {
  const lowerMessage = message.toLowerCase();
  
  // Keywords mapping
  const responses = {
    eligibility: [
      "Eligibility requirements vary by scholarship. Common requirements include GPA, academic level, nationality, and specific documents.",
      "Check the scholarship details page for specific eligibility criteria including age limits, education level, and minimum GPA requirements.",
      "Most scholarships require specific academic achievements and documentation. Please review individual scholarship requirements.",
    ],
    application: [
      "To apply, select a scholarship and click 'Apply Now'. Fill out the application form and upload required documents.",
      "The application process includes filling out your personal information, education details, and uploading supporting documents like transcripts and recommendation letters.",
      "After applying, you can track your application status in the 'My Applications' section.",
    ],
    deadline: [
      "Deadlines are clearly displayed on each scholarship listing. Make sure to apply before the deadline.",
      "Application deadlines vary by scholarship program. Check individual scholarship pages for specific dates.",
      "We recommend applying at least 2 weeks before the deadline to ensure all documents are submitted.",
    ],
    documents: [
      "Required documents typically include transcripts, recommendation letters, personal statement, and proof of identity.",
      "Each scholarship lists its specific document requirements. Check the scholarship details for a complete list.",
      "Common documents needed: official transcripts, letters of recommendation, resume/CV, and personal essay.",
    ],
    amount: [
      "Scholarship amounts vary significantly depending on the program. Check individual scholarship listings for specific amounts.",
      "Scholarships can range from partial tuition coverage to full funding including living expenses.",
      "Amounts are displayed in the scholarship listing with the currency specified.",
    ],
    general: [
      "I'm here to help with scholarship-related questions. You can browse scholarships, filter by category or country, and apply directly from the platform.",
      "Scholar Connect helps you discover and apply for scholarships. Use the search and filter options to find scholarships that match your profile.",
      "Feel free to ask about eligibility, applications, deadlines, or any other scholarship-related questions.",
    ],
  };
  
  // Simple keyword matching
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
    
    const response = getChatbotResponse(message, req.user);
    
    // Save message history
    const messageRecord = await Message.create({
      user: req.user ? req.user._id : null,
      message,
      response,
      category: 'general',
    });
    
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessageHistory = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(20);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

