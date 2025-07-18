const {toggleLike} = require("../index");
const {getFirestore} = require("firebase-admin/firestore");

describe("toggleLike", () => {
  let mockDb;
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockTransaction = {
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    
    mockDb = getFirestore();
    mockDb.runTransaction.mockImplementation((fn) => fn(mockTransaction));
  });

  it("should require authentication", async () => {
    const request = {
      auth: null,
      data: {haikuId: "haiku123"},
    };

    await expect(toggleLike.run(request)).rejects.toThrow("User must be authenticated");
  });

  it("should require haikuId", async () => {
    const request = {
      auth: {uid: "user123"},
      data: {},
    };

    await expect(toggleLike.run(request)).rejects.toThrow("Haiku ID is required");
  });

  it("should like a haiku when not already liked", async () => {
    const mockHaikuData = {
      content: "Test haiku",
      userId: "author123",
      likes: 5,
      likedBy: ["user456"],
    };

    mockTransaction.get
      .mockResolvedValueOnce({exists: false}) // Like doesn't exist
      .mockResolvedValueOnce({exists: true, data: () => mockHaikuData}); // Haiku exists

    const request = {
      auth: {uid: "user123"},
      data: {haikuId: "haiku123"},
    };

    const result = await toggleLike.run(request);

    expect(result).toEqual({liked: true, likes: 6});
    expect(mockTransaction.set).toHaveBeenCalled();
    expect(mockTransaction.update).toHaveBeenCalledTimes(2); // Haiku and author stats
  });

  it("should unlike a haiku when already liked", async () => {
    const mockHaikuData = {
      content: "Test haiku",
      userId: "author123",
      likes: 5,
      likedBy: ["user123", "user456"],
    };

    mockTransaction.get
      .mockResolvedValueOnce({exists: true}) // Like exists
      .mockResolvedValueOnce({exists: true, data: () => mockHaikuData}); // Haiku exists

    const request = {
      auth: {uid: "user123"},
      data: {haikuId: "haiku123"},
    };

    const result = await toggleLike.run(request);

    expect(result).toEqual({liked: false, likes: 4});
    expect(mockTransaction.delete).toHaveBeenCalled();
    expect(mockTransaction.update).toHaveBeenCalledTimes(2); // Haiku and author stats
  });

  it("should handle non-existent haiku", async () => {
    mockTransaction.get
      .mockResolvedValueOnce({exists: false}) // Like doesn't exist
      .mockResolvedValueOnce({exists: false}); // Haiku doesn't exist

    const request = {
      auth: {uid: "user123"},
      data: {haikuId: "non-existent"},
    };

    await expect(toggleLike.run(request)).rejects.toThrow("Haiku not found");
  });

  it("should handle haiku without userId", async () => {
    const mockHaikuData = {
      content: "Test haiku",
      likes: 5,
      // No userId
    };

    mockTransaction.get
      .mockResolvedValueOnce({exists: false})
      .mockResolvedValueOnce({exists: true, data: () => mockHaikuData});

    const request = {
      auth: {uid: "user123"},
      data: {haikuId: "haiku123"},
    };

    const result = await toggleLike.run(request);

    expect(result).toEqual({liked: true, likes: 6});
    // Should not update author stats
    expect(mockTransaction.update).toHaveBeenCalledTimes(1);
  });
});