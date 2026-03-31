const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require("../lib/prisma");
const jwt = require("jsonwebtoken");

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

console.log(genAI ? "🤖 Chatbot: Gemini AI initialized" : "⚠️ Chatbot: No API key — using fallback mode");

// Configure preferred Gemini models via env (comma-separated).
// Defaults to broadly supported models for this SDK/API generation.
const MODEL_CANDIDATES = (process.env.GEMINI_MODELS || "gemini-1.5-flash,gemini-1.5-pro")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const CHATBOT_MODE = (process.env.CHATBOT_MODE || "basic").toLowerCase();

// Helper: retry with backoff for rate-limit errors
const withRetry = async (fn, retries = 2, delayMs = 2000) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error.status === 429 || (error.message && error.message.includes("429"));
      if (isRateLimit && attempt < retries) {
        const wait = delayMs * Math.pow(2, attempt);
        console.log(`⏳ Gemini rate limited, retrying in ${wait}ms (attempt ${attempt + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, wait));
      } else {
        throw error;
      }
    }
  }
};

// Optional auth middleware — attaches user if token present, but doesn't block
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, course: true, university: true, gpa: true, marks: true, income: true, country: true },
      });
      if (user) req.user = user;
    }
  } catch {
    // Token invalid — continue as guest
  }
  next();
};

const SYSTEM_PROMPT = `You are ScholarBot, a friendly and knowledgeable AI assistant for ScholarConnect — a scholarship discovery and management platform.

Your role:
- Help students find scholarships, understand eligibility, navigate applications, and answer questions about financial aid.
- Provide accurate, helpful, and encouraging responses.
- Use information from the platform's scholarship database when available.

Rules:
- Be concise — respond in 2-5 sentences unless the user asks for detailed info.
- Be warm, encouraging, and supportive. Students can be stressed about finances.
- If you don't know something specific, suggest the user check the scholarship details page or contact the provider.
- You can help with: eligibility questions, application tips, deadline reminders, document requirements, general scholarship advice, financial aid questions.
- Never make up specific scholarship details that weren't provided to you. Only reference scholarships from the context data.
- Use emoji occasionally to be friendly 🎓
- If asked something completely unrelated to education/scholarships, politely redirect.
- Format your responses nicely — use bullet points, numbered lists, or bold text when it helps readability.
- When listing scholarships, include the name, amount, deadline, and country.`;

// Enhanced fallback responses with variety and dynamic content
const getFallbackResponse = async (message, user = null) => {
  const lower = message.toLowerCase();

  // Greeting responses
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    const greetings = [
      "Hello! 👋 I'm ScholarBot, your scholarship assistant. Ask me about eligibility, deadlines, applications, or recommendations!",
      "Hi there! 🎓 Welcome to ScholarConnect. I can help you find and apply for scholarships. What would you like to know?",
      "Hey! 👋 I'm here to help with all your scholarship questions. What can I assist you with today?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Eligibility responses
  if (lower.includes("eligib") || lower.includes("qualify") || lower.includes("requirements")) {
    const eligibilityResponses = [
      "Eligibility varies by scholarship! Common requirements include GPA minimums, specific education levels, nationality, and sometimes financial need. Check each scholarship's detail page for specifics. 🎓",
      "Great question! 🎯 Each scholarship has different eligibility criteria. Most look for: minimum GPA (2.5-3.5), specific courses/fields, citizenship requirements, and academic level. Visit a scholarship detail page to see exact requirements.",
      "Eligibility depends on the scholarship! 📋 Some require specific grades, others focus on financial need or background. The best way is to check the scholarship listing directly—it lists all requirements clearly.",
      "Common eligibility factors: 🎓 Academic performance (marks/GPA), course/field of study, nationality/residency, age, and financial situation. Browse our scholarships to find ones that match YOUR profile!",
    ];
    return eligibilityResponses[Math.floor(Math.random() * eligibilityResponses.length)];
  }

  // Application process responses
  if (lower.includes("apply") || lower.includes("application") || lower.includes("how to apply")) {
    const applicationResponses = [
      "To apply: 1️⃣ Browse scholarships & click 'Details' to check eligibility, 2️⃣ Click 'Apply Now' to fill the form, 3️⃣ Upload required documents, 4️⃣ Submit! Then track progress in 'My Applications'. 🚀",
      "Simple process! 📝 Find a scholarship → Click 'Apply' → Fill in your details → Upload documents → Submit. You can save drafts and come back later. Track everything in 'My Applications'!",
      "Ready to apply? 🎯 Each scholarship has an 'Apply' button on its detail page. The form asks for your info and documents. After submission, check 'My Applications' to see your status anytime!",
      "Applying is easy! 1️⃣ Find a scholarship, 2️⃣ Click 'Details' to verify you're eligible, 3️⃣ Hit 'Apply Now', 4️⃣ Complete the form, 5️⃣ Done! Your application is submitted and tracked automatically.",
    ];
    return applicationResponses[Math.floor(Math.random() * applicationResponses.length)];
  }

  // Deadline responses
  if (lower.includes("deadline") || lower.includes("when") || lower.includes("due date")) {
    try {
      const upcomingScholarships = await prisma.scholarship.findMany({
        where: { isActive: true, deadline: { gte: new Date() } },
        orderBy: { deadline: "asc" },
        take: 3,
        select: { title: true, deadline: true, provider: true },
      });

      if (upcomingScholarships.length > 0) {
        const deadlineList = upcomingScholarships
          .map((s) => `• **${s.title}** by ${s.provider}: ${new Date(s.deadline).toLocaleDateString()}`)
          .join("\n");
        return `⏰ **Upcoming Deadlines:**\n${deadlineList}\n\nI recommend applying at least 2 weeks before the deadline to ensure all documents are ready! 📅`;
      }
    } catch (err) {
      console.error("Error fetching deadlines:", err.message);
    }
    return "⏰ Each scholarship has its own deadline on the listing card. I recommend checking regularly and applying early—at least 2 weeks before the deadline! You can sort by 'Deadline Soon' to see urgent ones. 📅";
  }

  // Document responses
  if (lower.includes("document") || lower.includes("upload") || lower.includes("file") || lower.includes("what to submit")) {
    const documentResponses = [
      "📄 **Common Documents:**\n• Academic transcripts (marksheets)\n• Recommendation letters (2-3)\n• Personal statement/essay\n• ID proof (passport/national ID)\n• Income certificate (if needed)\n• Course proof\n\nEach scholarship lists specific requirements on its detail page!",
      "Documents typically needed: 📋 Your academic records, letters from professors/teachers, a personal essay about your goals, identity proof, and sometimes proof of finances. Check the specific scholarship for exact requirements!",
      "Most scholarships ask for: 📄 Transcripts, recommendation letters, personal statement, ID proof, and sometimes financial documents. The 'Apply' form will clearly show which documents each scholarship needs. Upload during application!",
      "Keep these ready: 📄 Your academic marks/transcripts, 2-3 recommendation letters from teachers, a personal statement (explain your ambitions!), valid ID, and income/financial documents if required. Each scholarship specifies what they need!",
    ];
    return documentResponses[Math.floor(Math.random() * documentResponses.length)];
  }

  // Recommendation responses
  if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("which scholarship") || lower.includes("match")) {
    const recommendationResponses = [
      user
        ? `🎯 Hi ${user.name}! Check our **AI Picks** section—it uses YOUR profile (${user.marks ? user.marks + "% marks, " : ""}${user.course || "your course"}) to find matching scholarships! You can also filter by category or country. 🚀`
        : "🎯 Visit the **'AI Picks'** section or use our filters on the Browse page! You can filter by category, country, amount, and your academics. Create a profile to get personalized recommendations! 🚀",
      "Want personalized matches? 🎓 Go to 'AI Picks' if you're logged in—it matches scholarships to YOUR marks, course, and profile. Or browse and filter by what you're looking for!",
      "The best way to find scholarships: 📊 Use our filters (category, country, amount) or let AI Picks suggest scholarships based on your academic profile if you're logged in. Every scholarship is unique!",
    ];
    return recommendationResponses[Math.floor(Math.random() * recommendationResponses.length)];
  }

  // Application status/tracking responses
  if (lower.includes("status") || lower.includes("track") || lower.includes("my application")) {
    const trackingResponses = [
      "📊 You can track all your applications in the **'My Applications'** section! Statuses are: 🔵 Pending → 🟡 Reviewed → 🟢 Accepted / 🔴 Rejected. You'll see updates in real-time!",
      "Visit **'My Applications'** to track everything! 📋 You'll see each scholarship you applied for, current status, submission date, and when the provider will review it. Check back regularly for updates!",
      "Your application journey: 📊 **My Applications** shows every scholarship you applied for. See the current status: Pending (waiting review), Reviewed (provider checking), Accepted (congrats! 🎉), or Rejected. Simple tracking!",
      "Track your progress! 📈 Go to **'My Applications'** → View all your submissions → See the status of each one → Get notified when providers update your status. It's all in one place!",
    ];
    return trackingResponses[Math.floor(Math.random() * trackingResponses.length)];
  }

  // GPA/Marks responses
  if (lower.includes("gpa") || lower.includes("marks") || lower.includes("grade") || lower.includes("score")) {
    const gpaResponses = [
      "📈 Many scholarships require a minimum GPA/marks! Common minimums are 60-75% or GPA 2.5-3.5. **Update your marks in your Profile page**—our AI Picks engine uses this to find the best scholarships for YOU! 🎯",
      "Your academic scores matter! 📊 Most scholarships list a minimum GPA or percentage. Go to your **Profile** and update your marks/GPA—this helps our system recommend scholarships you're eligible for!",
      "Good question! 🎓 Some scholarships are for high achievers (80%+), others are accessible to all students. Your grades help determine which scholarships match you best. Update your profile, and we'll show you personalized picks!",
    ];
    return gpaResponses[Math.floor(Math.random() * gpaResponses.length)];
  }

  // Catch-all response
  const generalResponses = [
    "🎓 I can help with:\n• **Eligibility** — What scholarships can you apply for?\n• **Application** — How to apply step-by-step\n• **Deadlines** — When to submit\n• **Documents** — What to upload\n• **Tracking** — Check your application status\n• **Recommendations** — Find scholarships for you\n\nWhat would you like to know?",
    "I'm here to help! 🤝 Ask me about:\n✅ Finding scholarships that match you\n✅ How to apply and what documents you need\n✅ Tracking your applications\n✅ Eligibility requirements\n✅ Deadlines and tips\n\nWhat's on your mind?",
    "Let me help! 📚 You can ask me about:\n• Scholarship search & filtering\n• Application process\n• Required documents\n• Eligibility criteria\n• Tracking applications\n• General advice\n\nWhat would you like to know?",
  ];
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
};

const detectCountryFromMessage = (message) => {
  const lower = message.toLowerCase();
  const countryMap = [
    { key: "india", value: "India" },
    { key: "usa", value: "USA" },
    { key: "united states", value: "USA" },
    { key: "uk", value: "UK" },
    { key: "united kingdom", value: "UK" },
    { key: "canada", value: "Canada" },
    { key: "australia", value: "Australia" },
  ];

  const match = countryMap.find((item) => lower.includes(item.key));
  return match ? match.value : null;
}

const formatScholarshipSuggestions = (scholarships) => {
  return scholarships
    .map((s) => {
      const amount = `${s.currency} ${Number(s.amount).toLocaleString()}`;
      const deadline = new Date(s.deadline).toLocaleDateString();
      return `- **${s.title}** (${s.provider}) | ${amount} | Deadline: ${deadline} | ${s.country}`;
    })
    .join("\n");
}

const parseBudgetFromMessage = (message) => {
  const lower = message.toLowerCase();
  const normalized = lower.replace(/,/g, "");
  const underPattern = /\b(under|below|less than|max(?:imum)?|upto|up to)\s+(\d+(?:\.\d+)?)\s*(lakh|lac|k)?\b/i;
  const amountOnlyPattern = /\b(\d+(?:\.\d+)?)\s*(lakh|lac|k)\b/i;

  const parseAmount = (numText, unit) => {
    const base = Number(numText);
    if (!Number.isFinite(base)) {
      return null;
    }
    if (!unit) {
      return base;
    }
    const u = unit.toLowerCase();
    if (u === "k") {
      return base * 1000;
    }
    if (u === "lakh" || u === "lac") {
      return base * 100000;
    }
    return base;
  };

  const underMatch = normalized.match(underPattern);
  if (underMatch) {
    const amount = parseAmount(underMatch[2], underMatch[3]);
    if (amount) {
      return amount;
    }
  }

  const hasBudgetIntent =
    normalized.includes("budget") ||
    normalized.includes("inr") ||
    normalized.includes("rupee") ||
    normalized.includes("rs");
  const amountOnlyMatch = normalized.match(amountOnlyPattern);
  if (hasBudgetIntent && amountOnlyMatch) {
    const amount = parseAmount(amountOnlyMatch[1], amountOnlyMatch[2]);
    if (amount) {
      return amount;
    }
  }

  return null;
}

const getBasicBotResponse = async (message, user = null) => {
  const lower = message.toLowerCase();
  const hasWord = (word) => new RegExp(`\\b${word}\\b`, "i").test(message);
  const isSuggestionQuery =
    lower.includes("suggest") ||
    lower.includes("recommend") ||
    lower.includes("scholarship") ||
    lower.includes("which one") ||
    lower.includes("best");
  const requestedCountry = detectCountryFromMessage(message) || user?.country || null;
  const budgetCap = parseBudgetFromMessage(message);

  if (hasWord("hello") || hasWord("hi") || hasWord("hey")) {
    return "Hello! I am ScholarBot. Ask me about scholarships, eligibility, deadlines, documents, and application steps."
  }

  if (lower.includes("eligib") || lower.includes("qualify") || lower.includes("requirement")) {
    return "Eligibility usually depends on GPA/marks, course, country, and required documents. Open a scholarship detail page to check exact criteria."
  }

  if (lower.includes("apply") || lower.includes("application")) {
    return "To apply: open a scholarship, check eligibility, click Apply Now, fill the form, upload documents, and submit."
  }

  if (lower.includes("deadline") || lower.includes("last date") || lower.includes("due")) {
    try {
      const where = {
        isActive: true,
        deadline: { gte: new Date() },
      };
      if (requestedCountry) {
        where.country = { equals: requestedCountry, mode: "insensitive" };
      }

      const upcoming = await prisma.scholarship.findMany({
        where,
        orderBy: { deadline: "asc" },
        take: 3,
        select: {
          title: true,
          provider: true,
          amount: true,
          currency: true,
          deadline: true,
          country: true,
        },
      });

      if (upcoming.length > 0) {
        return `Here are upcoming scholarship deadlines${requestedCountry ? ` in ${requestedCountry}` : ""}:\n${formatScholarshipSuggestions(upcoming)}`
      }
    } catch (err) {
      console.error("Basic bot deadline query failed:", err.message);
    }
    return "Each scholarship has its own deadline shown on the listing/detail page. Apply early to avoid last-minute issues."
  }

  if (lower.includes("document") || lower.includes("upload") || lower.includes("file")) {
    return "Common documents: transcripts/marksheets, recommendation letters, personal statement, ID proof, and income proof (if required)."
  }

  if (lower.includes("internship")) {
    return "I mainly help with scholarships. For internships, please check the platform's opportunities section or filters for country and domain."
  }

  if (isSuggestionQuery || lower.includes("india")) {
    try {
      const where = {
        isActive: true,
        deadline: { gte: new Date() },
      };
      if (requestedCountry) {
        where.country = { equals: requestedCountry, mode: "insensitive" };
      }
      if (budgetCap) {
        where.amount = { lte: budgetCap };
      }

      const scholarships = await prisma.scholarship.findMany({
        where,
        orderBy: [
          { deadline: "asc" },
          { amount: "desc" },
        ],
        take: 5,
        select: {
          title: true,
          provider: true,
          amount: true,
          currency: true,
          deadline: true,
          country: true,
        },
      });

      if (scholarships.length > 0) {
        const budgetText = budgetCap ? ` under ${Number(budgetCap).toLocaleString()} budget` : "";
        return `Here are scholarship suggestions${requestedCountry ? ` for ${requestedCountry}` : ""}${budgetText}:\n${formatScholarshipSuggestions(scholarships)}\n\nTell me your preferred country, category, or budget and I can narrow these down.`
      }
      return `I could not find active upcoming scholarships${requestedCountry ? ` for ${requestedCountry}` : ""}${budgetCap ? ` within ${Number(budgetCap).toLocaleString()} budget` : ""} right now. Try increasing budget or removing filters.`
    } catch (err) {
      console.error("Basic bot recommendation query failed:", err.message);
    }
    return "You can filter scholarships by country and category to get better suggestions."
  }

  return "I can help with eligibility, applications, deadlines, documents, recommendations, and tracking. What would you like to know?"
}

// Build rich context from the database
const buildDatabaseContext = async (user) => {
  const contextParts = [];

  try {
    // Get active scholarship stats
    const scholarshipCount = await prisma.scholarship.count({ where: { isActive: true } });
    contextParts.push(`The platform currently has ${scholarshipCount} active scholarships.`);

    // Get upcoming scholarships (deadline in next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingScholarships = await prisma.scholarship.findMany({
      where: {
        isActive: true,
        deadline: { gte: new Date(), lte: thirtyDaysFromNow },
      },
      orderBy: { deadline: "asc" },
      take: 10,
      select: {
        title: true,
        amount: true,
        currency: true,
        deadline: true,
        country: true,
        category: true,
        provider: true,
        eligibility: true,
      },
    });

    if (upcomingScholarships.length > 0) {
      contextParts.push("\nScholarships with upcoming deadlines:");
      upcomingScholarships.forEach((s) => {
        contextParts.push(
          `- "${s.title}" by ${s.provider}: ${s.currency} ${s.amount}, Deadline: ${s.deadline.toISOString().split("T")[0]}, Country: ${s.country}, Category: ${s.category}${s.eligibility ? ", Eligibility: " + JSON.stringify(s.eligibility) : ""}`
        );
      });
    }

    // Get category distribution
    const categories = await prisma.scholarship.groupBy({
      by: ["category"],
      where: { isActive: true },
      _count: true,
    });
    if (categories.length > 0) {
      contextParts.push("\nScholarship categories available: " + categories.map(c => `${c.category} (${c._count})`).join(", "));
    }

    // Get country distribution
    const countries = await prisma.scholarship.groupBy({
      by: ["country"],
      where: { isActive: true },
      _count: true,
    });
    if (countries.length > 0) {
      contextParts.push("Countries available: " + countries.map(c => `${c.country} (${c._count})`).join(", "));
    }

    // If user is logged in, get their profile context
    if (user) {
      const userParts = [`\nAbout the current user (${user.name}):`];
      if (user.course) userParts.push(`- Course: ${user.course}`);
      if (user.university) userParts.push(`- University: ${user.university}`);
      if (user.gpa) userParts.push(`- GPA: ${user.gpa}`);
      if (user.marks) userParts.push(`- Marks: ${user.marks}%`);
      if (user.income) userParts.push(`- Family Income: ${user.income}`);
      if (user.country) userParts.push(`- Country: ${user.country}`);

      if (userParts.length > 1) {
        contextParts.push(userParts.join("\n"));
        contextParts.push("Use this info to personalize scholarship recommendations when relevant.");
      }

      // Get user's application count
      const appCount = await prisma.application.count({ where: { studentId: user.id } });
      if (appCount > 0) {
        contextParts.push(`The user has applied to ${appCount} scholarship(s).`);
      }
    }
  } catch (err) {
    console.error("Error building context:", err.message);
  }

  return contextParts.join("\n");
};

// In-memory conversation store (per-session, keyed by a session identifier)
// Each entry: { history: [{role, parts}], lastAccessed: timestamp }
const conversationStore = new Map();

// Cleanup old conversations every 30 minutes
setInterval(() => {
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  for (const [key, value] of conversationStore) {
    if (value.lastAccessed < thirtyMinutesAgo) {
      conversationStore.delete(key);
    }
  }
}, 30 * 60 * 1000);

// Get or create conversation session key
const getSessionKey = (req) => {
  if (req.user?.id) return `user-${req.user.id}`;
  // For guests, use IP + user-agent as a rough session key
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  return `guest-${ip}-${ua.slice(0, 50)}`;
};

router.post("/", optionalAuth, async (req, res) => {
  const { message, clearHistory } = req.body;
  if (!message) return res.status(400).json({ message: "Please provide a message" });

  const sessionKey = getSessionKey(req);

  // Allow client to clear conversation history
  if (clearHistory) {
    conversationStore.delete(sessionKey);
  }

  try {
    let response;
    let aiUsed = false;

    if (CHATBOT_MODE === "basic") {
      response = await getBasicBotResponse(message, req.user);
    } else if (genAI) {
      // Build database context
      const dbContext = await buildDatabaseContext(req.user);

      // Get or create conversation history
      let session = conversationStore.get(sessionKey);
      if (!session) {
        session = { history: [], lastAccessed: Date.now() };
        conversationStore.set(sessionKey, session);
      }
      session.lastAccessed = Date.now();

      const chatHistory = session.history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      }));

      const systemPrompt = `${SYSTEM_PROMPT}\n\n--- Platform Data ---\n${dbContext}`;

      // Try models in order (fallback chain)
      const models = MODEL_CANDIDATES;
      let lastError = null;

      for (const modelName of models) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const chat = model.startChat({
            history: chatHistory,
            systemInstruction: systemPrompt,
          });

          const result = await withRetry(() => chat.sendMessage(message), 2, 3000);
          response = result.response.text();
          aiUsed = true;
          console.log(`✅ Chatbot responded via ${modelName}`);
          break; // Success — stop trying other models
        } catch (err) {
          console.error(`❌ ${modelName} failed:`, {
            status: err.status,
            message: err.message?.substring(0, 180),
          });
          lastError = err;
          continue; // Try next model
        }
      }

      if (!response) {
        // All models failed
        const isRateLimit = lastError?.status === 429 || lastError?.message?.includes("429");
        if (isRateLimit) {
          response = "⏳ I'm getting too many requests right now (API rate limit). Please wait a minute and try again! In the meantime, try browsing the scholarships page directly. 🎓";
        } else {
          response = await getFallbackResponse(message, req.user);
        }
      } else {
        // Save to conversation history (keep last 20 turns = 40 messages)
        session.history.push({ role: "user", text: message });
        session.history.push({ role: "model", text: response });
        if (session.history.length > 40) {
          session.history = session.history.slice(-40);
        }
      }
    } else {
      // Fallback to rule-based
      response = await getFallbackResponse(message, req.user);
    }

    // Save to database history (best-effort)
    try {
      await prisma.message.create({
        data: {
          userId: req.user?.id || null,
          message,
          response,
          category: "general",
        },
      });
    } catch {
      // Silent fail on history save
    }

    res.json({ response, isAI: aiUsed, fallback: !aiUsed });
  } catch (error) {
    console.error("Chatbot error:", error.message);
    // Fallback if AI fails
    const fallback = await getFallbackResponse(message, req.user);
    res.json({ response: fallback, isAI: false, fallback: true });
  }
});

// Get chat history for logged-in users
router.get("/history", optionalAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Login required for history" });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(messages.map((m) => ({ ...m, _id: m.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear conversation memory
router.delete("/clear", optionalAuth, (req, res) => {
  const sessionKey = getSessionKey(req);
  conversationStore.delete(sessionKey);
  res.json({ message: "Conversation cleared" });
});

module.exports = router;