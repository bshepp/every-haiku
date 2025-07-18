const {onCall} = require("firebase-functions/v2/https");
const {onSchedule: onScheduleTask} = require("firebase-functions/v2/scheduler");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const fetch = require("node-fetch");

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Claude API configuration - now using environment variables
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

// Rate limiting map
const rateLimitMap = new Map();

/**
 * Helper function for rate limiting
 * @param {string} userId - User ID to check rate limit for
 */
function checkRateLimit(userId) {
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;
  const key = `${userId}_${Math.floor(Date.now() / windowMs)}`;

  const current = rateLimitMap.get(key) || 0;
  if (current >= maxRequests) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  rateLimitMap.set(key, current + 1);

  // Clean up old entries
  const oldWindow = Math.floor(Date.now() / windowMs) - 2;
  for (const [k] of rateLimitMap) {
    const window = parseInt(k.split("_")[1]);
    if (window < oldWindow) {
      rateLimitMap.delete(k);
    }
  }
}

// Function to generate AI haiku using Claude
exports.generateAIHaiku = onCall(async (request) => {
  // Check authentication
  if (!request.auth) {
    throw new Error("User must be authenticated");
  }

  // Rate limiting
  try {
    checkRateLimit(request.auth.uid);
  } catch (error) {
    throw new Error(error.message);
  }

  const theme = request.data.theme || "nature";

  // Validate and sanitize theme input
  const sanitizedTheme = theme.trim().slice(0, 50).replace(/[^a-zA-Z0-9\s-]/g, "");

  if (!CLAUDE_API_KEY) {
    throw new Error("Claude API key not configured");
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 100,
        messages: [{
          role: "user",
          content: `Generate a haiku (5-7-5 syllable pattern) about: ${sanitizedTheme}. 
                             Return only the haiku with line breaks, no explanation or additional text.`,
        }],
      }),
    });

    const result = await response.json();

    if (result.content && result.content[0] && result.content[0].text) {
      return {
        haiku: result.content[0].text.trim(),
        isAI: true,
      };
    } else {
      throw new Error("Invalid response from Claude API");
    }
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw new Error("Failed to generate haiku");
  }
});

// Scheduled function to delete old unsaved haikus
exports.cleanupOldHaikus = onScheduleTask("every 24 hours", async (event) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const snapshot = await db.collection("haikus")
      .where("isSaved", "==", false)
      .where("createdAt", "<", thirtyDaysAgo)
      .get();

    const batch = db.batch();
    let deleteCount = 0;

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    if (deleteCount > 0) {
      await batch.commit();
      console.log(`Deleted ${deleteCount} old unsaved haikus`);
    } else {
      console.log("No old haikus to delete");
    }
  } catch (error) {
    console.error("Error cleaning up old haikus:", error);
    throw error;
  }
});

// Function to generate hashtags
exports.generateHashtags = onCall(async (request) => {
  const {theme, content} = request.data;

  if (!content) {
    throw new Error("Content is required");
  }

  const hashtags = ["#haiku", "#poetry", "#mindfulness"];

  if (theme) {
    const sanitizedTheme = theme.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (sanitizedTheme) {
      hashtags.push(`#${sanitizedTheme}`);
    }
  }

  // Extract key nature words
  const natureKeywords = ["cherry", "blossom", "moon", "mountain", "river", "ocean",
    "forest", "snow", "rain", "sunset", "sunrise", "flower"];

  natureKeywords.forEach((keyword) => {
    if (content.toLowerCase().includes(keyword)) {
      hashtags.push(`#${keyword}`);
    }
  });

  // Add seasonal hashtags
  const seasonWords = {
    spring: ["cherry", "blossom", "bloom", "fresh"],
    summer: ["sun", "warm", "heat", "beach"],
    autumn: ["fall", "leaves", "harvest", "golden"],
    winter: ["snow", "cold", "frost", "ice"],
  };

  Object.entries(seasonWords).forEach(([season, words]) => {
    if (words.some((word) => content.toLowerCase().includes(word))) {
      hashtags.push(`#${season}`);
    }
  });

  // Remove duplicates and limit to 5
  return [...new Set(hashtags)].slice(0, 5);
});

// Function to get user stats
exports.getUserStats = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated");
  }

  const userId = request.auth.uid;

  try {
    const [totalHaikus, savedHaikus, publicHaikus] = await Promise.all([
      db.collection("haikus").where("userId", "==", userId).get(),
      db.collection("userHaikus").doc(userId).collection("saved").get(),
      db.collection("haikus").where("userId", "==", userId).where("isPublic", "==", true).get(),
    ]);

    return {
      total: totalHaikus.size,
      saved: savedHaikus.size,
      public: publicHaikus.size,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw new Error("Failed to get user stats");
  }
});
