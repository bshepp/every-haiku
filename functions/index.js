const {onCall} = require("firebase-functions/v2/https");
const {onSchedule: onScheduleTask} = require("firebase-functions/v2/scheduler");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
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
  // Require authentication
  if (!request.auth) {
    throw new Error("User must be authenticated");
  }

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

// Function to update user profile
exports.updateProfile = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated");
  }

  const userId = request.auth.uid;
  const {displayName, bio, website, socialLinks, username} = request.data;

  // Validate inputs
  if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    throw new Error("Username must be 3-20 characters, alphanumeric and underscore only");
  }

  const updates = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Add provided fields
  if (displayName) updates.displayName = displayName.trim().slice(0, 50);
  if (bio !== undefined) updates.bio = bio.trim().slice(0, 200);
  if (website !== undefined) updates.website = website.trim().slice(0, 100);
  if (socialLinks) {
    updates.socialLinks = {
      twitter: socialLinks.twitter?.trim().slice(0, 50) || "",
      instagram: socialLinks.instagram?.trim().slice(0, 50) || "",
    };
  }

  try {
    // Handle username change
    if (username) {
      const userDoc = await db.collection("users").doc(userId).get();
      const currentUsername = userDoc.data()?.username;

      if (currentUsername !== username) {
        // Check if username is available
        const usernameDoc = await db.collection("usernames").doc(username).get();
        if (usernameDoc.exists) {
          throw new Error("Username already taken");
        }

        // Use transaction to ensure atomicity
        await db.runTransaction(async (transaction) => {
          // Delete old username if exists
          if (currentUsername) {
            transaction.delete(db.collection("usernames").doc(currentUsername));
          }

          // Create new username document
          transaction.set(db.collection("usernames").doc(username), {
            userId: userId,
            createdAt: FieldValue.serverTimestamp(),
          });

          // Update user profile
          updates.username = username;
          transaction.update(db.collection("users").doc(userId), updates);
        });

        return {success: true, username};
      }
    }

    // Normal update without username change
    await db.collection("users").doc(userId).update(updates);
    return {success: true};
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error(error.message || "Failed to update profile");
  }
});

// Function to toggle like on a haiku
exports.toggleLike = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated");
  }

  const userId = request.auth.uid;
  const {haikuId} = request.data;

  if (!haikuId) {
    throw new Error("Haiku ID is required");
  }

  try {
    const likeRef = db.collection("userLikes").doc(userId).collection("likes").doc(haikuId);
    const haikuRef = db.collection("haikus").doc(haikuId);

    const result = await db.runTransaction(async (transaction) => {
      const likeDoc = await transaction.get(likeRef);
      const haikuDoc = await transaction.get(haikuRef);

      if (!haikuDoc.exists) {
        throw new Error("Haiku not found");
      }

      const haikuData = haikuDoc.data();
      const isLiked = likeDoc.exists;

      if (isLiked) {
        // Unlike
        transaction.delete(likeRef);
        transaction.update(haikuRef, {
          likes: FieldValue.increment(-1),
          likedBy: FieldValue.arrayRemove(userId),
        });

        // Update author's stats
        if (haikuData.userId) {
          transaction.update(db.collection("users").doc(haikuData.userId), {
            "stats.totalLikes": FieldValue.increment(-1),
          });
        }

        return {liked: false, likes: (haikuData.likes || 1) - 1};
      } else {
        // Like
        transaction.set(likeRef, {
          likedAt: FieldValue.serverTimestamp(),
        });
        transaction.update(haikuRef, {
          likes: FieldValue.increment(1),
          likedBy: FieldValue.arrayUnion(userId),
        });

        // Update author's stats
        if (haikuData.userId) {
          transaction.update(db.collection("users").doc(haikuData.userId), {
            "stats.totalLikes": FieldValue.increment(1),
          });
        }

        return {liked: true, likes: (haikuData.likes || 0) + 1};
      }
    });

    return result;
  } catch (error) {
    console.error("Error toggling like:", error);
    throw new Error("Failed to toggle like");
  }
});

// Function to follow/unfollow a user
exports.toggleFollow = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated");
  }

  const userId = request.auth.uid;
  const {targetUserId} = request.data;

  if (!targetUserId) {
    throw new Error("Target user ID is required");
  }

  if (userId === targetUserId) {
    throw new Error("Cannot follow yourself");
  }

  try {
    const followingRef = db.collection("following").doc(userId)
      .collection("users").doc(targetUserId);
    const followersRef = db.collection("followers").doc(targetUserId)
      .collection("users").doc(userId);

    const result = await db.runTransaction(async (transaction) => {
      const followingDoc = await transaction.get(followingRef);
      const isFollowing = followingDoc.exists;

      if (isFollowing) {
        // Unfollow
        transaction.delete(followingRef);
        transaction.delete(followersRef);

        // Update stats
        transaction.update(db.collection("users").doc(userId), {
          "stats.totalFollowing": FieldValue.increment(-1),
        });
        transaction.update(db.collection("users").doc(targetUserId), {
          "stats.totalFollowers": FieldValue.increment(-1),
        });

        return {following: false};
      } else {
        // Follow
        const timestamp = FieldValue.serverTimestamp();
        transaction.set(followingRef, {followedAt: timestamp});
        transaction.set(followersRef, {followedAt: timestamp});

        // Update stats
        transaction.update(db.collection("users").doc(userId), {
          "stats.totalFollowing": FieldValue.increment(1),
        });
        transaction.update(db.collection("users").doc(targetUserId), {
          "stats.totalFollowers": FieldValue.increment(1),
        });

        return {following: true};
      }
    });

    return result;
  } catch (error) {
    console.error("Error toggling follow:", error);
    throw new Error("Failed to toggle follow");
  }
});

// Function to create a collection
exports.createCollection = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated");
  }

  const userId = request.auth.uid;
  const {name, description, isPublic} = request.data;

  if (!name || name.trim().length < 3) {
    throw new Error("Collection name must be at least 3 characters");
  }

  try {
    const collectionData = {
      name: name.trim().slice(0, 50),
      description: description?.trim().slice(0, 200) || "",
      userId: userId,
      isPublic: isPublic || false,
      haikuCount: 0,
      followerCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("collections").add(collectionData);
    return {id: docRef.id, ...collectionData};
  } catch (error) {
    console.error("Error creating collection:", error);
    throw new Error("Failed to create collection");
  }
});

// Function to add haiku to collection
exports.addToCollection = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated");
  }

  const userId = request.auth.uid;
  const {collectionId, haikuId} = request.data;

  if (!collectionId || !haikuId) {
    throw new Error("Collection ID and Haiku ID are required");
  }

  try {
    await db.runTransaction(async (transaction) => {
      const collectionDoc = await transaction.get(
        db.collection("collections").doc(collectionId)
      );

      if (!collectionDoc.exists) {
        throw new Error("Collection not found");
      }

      if (collectionDoc.data().userId !== userId) {
        throw new Error("You can only add to your own collections");
      }

      const haikuDoc = await transaction.get(
        db.collection("haikus").doc(haikuId)
      );

      if (!haikuDoc.exists) {
        throw new Error("Haiku not found");
      }

      // Add haiku to collection
      transaction.set(
        db.collection("collectionHaikus").doc(collectionId)
          .collection("haikus").doc(haikuId),
        {
          addedAt: FieldValue.serverTimestamp(),
          order: collectionDoc.data().haikuCount || 0,
        }
      );

      // Update collection count
      transaction.update(db.collection("collections").doc(collectionId), {
        haikuCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return {success: true};
  } catch (error) {
    console.error("Error adding to collection:", error);
    throw new Error(error.message || "Failed to add to collection");
  }
});
