// Mock Firebase Admin
jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(),
}));

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        get: jest.fn(),
        where: jest.fn(() => ({
          get: jest.fn(),
        })),
        orderBy: jest.fn(() => ({
          get: jest.fn(),
          limit: jest.fn(() => ({
            get: jest.fn(),
          })),
        })),
      })),
    })),
    batch: jest.fn(() => ({
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn(),
    })),
    runTransaction: jest.fn(),
  })),
  FieldValue: {
    serverTimestamp: jest.fn(() => "TIMESTAMP"),
    increment: jest.fn((n) => `INCREMENT(${n})`),
    arrayUnion: jest.fn((...args) => `ARRAY_UNION(${args.join(",")})`),
    arrayRemove: jest.fn((...args) => `ARRAY_REMOVE(${args.join(",")})`),
  },
}));

// Mock node-fetch
jest.mock("node-fetch");

// Set test environment variables
process.env.CLAUDE_API_KEY = "test-api-key";