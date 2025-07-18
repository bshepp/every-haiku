const {updateProfile} = require("../index");
const {getFirestore} = require("firebase-admin/firestore");

describe("updateProfile", () => {
  let mockDb;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = getFirestore();
  });

  it("should require authentication", async () => {
    const request = {
      auth: null,
      data: {displayName: "Test User"},
    };

    await expect(updateProfile.run(request)).rejects.toThrow("User must be authenticated");
  });

  it("should update basic profile information", async () => {
    const mockUserDoc = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({username: null}),
      }),
    };
    
    const mockUpdate = jest.fn().mockResolvedValue();
    
    mockDb.collection().doc.mockReturnValue({
      get: mockUserDoc.get,
      update: mockUpdate,
    });

    const request = {
      auth: {uid: "user123"},
      data: {
        displayName: "John Doe",
        bio: "Haiku enthusiast",
        website: "https://example.com",
        socialLinks: {
          twitter: "@johndoe",
          instagram: "@johndoe",
        },
      },
    };

    const result = await updateProfile.run(request);

    expect(result).toEqual({success: true});
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: "John Doe",
        bio: "Haiku enthusiast",
        website: "https://example.com",
        socialLinks: {
          twitter: "@johndoe",
          instagram: "@johndoe",
        },
      })
    );
  });

  it("should validate username format", async () => {
    const request = {
      auth: {uid: "user123"},
      data: {
        username: "invalid username!",
      },
    };

    await expect(updateProfile.run(request)).rejects.toThrow(
      "Username must be 3-20 characters, alphanumeric and underscore only"
    );
  });

  it("should check username uniqueness", async () => {
    const mockUserDoc = {
      exists: true,
      data: () => ({username: null}),
    };
    
    const mockUsernameDoc = {
      exists: true, // Username already taken
    };
    
    mockDb.collection().doc.mockImplementation((id) => ({
      get: jest.fn().mockResolvedValue(
        id === "user123" ? mockUserDoc : mockUsernameDoc
      ),
    }));

    const request = {
      auth: {uid: "user123"},
      data: {
        username: "taken_username",
      },
    };

    await expect(updateProfile.run(request)).rejects.toThrow("Username already taken");
  });

  it("should handle username creation with transaction", async () => {
    const mockUserDoc = {
      exists: true,
      data: () => ({username: null}),
    };
    
    const mockUsernameDoc = {
      exists: false, // Username available
    };
    
    mockDb.collection().doc.mockImplementation((id) => ({
      get: jest.fn().mockResolvedValue(
        id === "user123" ? mockUserDoc : mockUsernameDoc
      ),
    }));
    
    const mockTransaction = {
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    
    mockDb.runTransaction.mockImplementation((fn) => fn(mockTransaction));

    const request = {
      auth: {uid: "user123"},
      data: {
        username: "new_username",
        displayName: "John Doe",
      },
    };

    const result = await updateProfile.run(request);

    expect(result).toEqual({success: true, username: "new_username"});
    expect(mockTransaction.set).toHaveBeenCalled();
    expect(mockTransaction.update).toHaveBeenCalled();
  });

  it("should truncate long inputs", async () => {
    const mockUpdate = jest.fn().mockResolvedValue();
    
    mockDb.collection().doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({}),
      }),
      update: mockUpdate,
    });

    const request = {
      auth: {uid: "user123"},
      data: {
        displayName: "A".repeat(100), // Too long
        bio: "B".repeat(300), // Too long
        website: "https://" + "c".repeat(200) + ".com", // Too long
      },
    };

    await updateProfile.run(request);

    const updateCall = mockUpdate.mock.calls[0][0];
    expect(updateCall.displayName).toHaveLength(50);
    expect(updateCall.bio).toHaveLength(200);
    expect(updateCall.website).toHaveLength(100);
  });
});