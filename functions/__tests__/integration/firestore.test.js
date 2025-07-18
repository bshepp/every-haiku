const firebase = require("@firebase/testing");
const {initializeTestEnvironment, assertSucceeds, assertFails} = require("@firebase/rules-unit-testing");

// Load Firestore rules
const fs = require("fs");
const path = require("path");

describe("Firestore Security Rules", () => {
  let testEnv;
  let unauthedDb;
  let authedDb;
  let adminDb;

  beforeAll(async () => {
    // Initialize test environment
    testEnv = await initializeTestEnvironment({
      projectId: "test-project",
      firestore: {
        rules: fs.readFileSync(path.join(__dirname, "../../../firestore.rules"), "utf8"),
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    
    // Create test contexts
    unauthedDb = testEnv.unauthenticatedContext().firestore();
    authedDb = testEnv.authenticatedContext("user123").firestore();
    adminDb = testEnv.authenticatedContext("admin").firestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("Users Collection", () => {
    it("should allow public read of user profiles", async () => {
      await adminDb.collection("users").doc("user123").set({
        displayName: "Test User",
        username: "testuser",
      });

      await assertSucceeds(
        unauthedDb.collection("users").doc("user123").get()
      );
    });

    it("should only allow users to update their own profile", async () => {
      await assertSucceeds(
        authedDb.collection("users").doc("user123").set({
          displayName: "Test User",
          createdAt: new Date(),
        })
      );

      await assertFails(
        authedDb.collection("users").doc("other-user").set({
          displayName: "Other User",
          createdAt: new Date(),
        })
      );
    });

    it("should prevent users from deleting profiles", async () => {
      await authedDb.collection("users").doc("user123").set({
        displayName: "Test User",
        createdAt: new Date(),
      });

      await assertFails(
        authedDb.collection("users").doc("user123").delete()
      );
    });
  });

  describe("Haikus Collection", () => {
    it("should allow anyone to read public haikus", async () => {
      await adminDb.collection("haikus").doc("haiku1").set({
        content: "Test haiku",
        isPublic: true,
        userId: "author123",
      });

      await assertSucceeds(
        unauthedDb.collection("haikus").doc("haiku1").get()
      );
    });

    it("should only allow reading private haikus by owner", async () => {
      await adminDb.collection("haikus").doc("haiku1").set({
        content: "Private haiku",
        isPublic: false,
        userId: "user123",
      });

      await assertSucceeds(
        authedDb.collection("haikus").doc("haiku1").get()
      );

      const otherUserDb = testEnv.authenticatedContext("other-user").firestore();
      await assertFails(
        otherUserDb.collection("haikus").doc("haiku1").get()
      );
    });

    it("should require all fields when creating haiku", async () => {
      await assertFails(
        authedDb.collection("haikus").add({
          content: "Incomplete haiku",
          // Missing required fields
        })
      );

      await assertSucceeds(
        authedDb.collection("haikus").add({
          content: "Complete haiku",
          theme: "nature",
          isAI: false,
          createdAt: new Date(),
          isPublic: false,
          isSaved: false,
          userId: "user123",
        })
      );
    });
  });

  describe("Username Uniqueness", () => {
    it("should enforce username uniqueness", async () => {
      await authedDb.collection("usernames").doc("testuser").set({
        userId: "user123",
        createdAt: new Date(),
      });

      const otherUserDb = testEnv.authenticatedContext("other-user").firestore();
      await assertFails(
        otherUserDb.collection("usernames").doc("testuser").set({
          userId: "other-user",
          createdAt: new Date(),
        })
      );
    });

    it("should not allow username updates", async () => {
      await authedDb.collection("usernames").doc("testuser").set({
        userId: "user123",
        createdAt: new Date(),
      });

      await assertFails(
        authedDb.collection("usernames").doc("testuser").update({
          userId: "different-user",
        })
      );
    });
  });

  describe("Collections", () => {
    it("should allow reading public collections", async () => {
      await adminDb.collection("collections").doc("col1").set({
        name: "Public Collection",
        isPublic: true,
        userId: "author123",
      });

      await assertSucceeds(
        unauthedDb.collection("collections").doc("col1").get()
      );
    });

    it("should restrict private collections to owner", async () => {
      await adminDb.collection("collections").doc("col1").set({
        name: "Private Collection",
        isPublic: false,
        userId: "user123",
      });

      await assertSucceeds(
        authedDb.collection("collections").doc("col1").get()
      );

      const otherUserDb = testEnv.authenticatedContext("other-user").firestore();
      await assertFails(
        otherUserDb.collection("collections").doc("col1").get()
      );
    });
  });
});