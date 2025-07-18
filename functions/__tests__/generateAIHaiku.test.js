const {generateAIHaiku} = require("../index");
const fetch = require("node-fetch");

jest.mock("node-fetch");

describe("generateAIHaiku", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication", async () => {
    const request = {
      auth: null,
      data: {theme: "nature"},
    };

    await expect(generateAIHaiku.run(request)).rejects.toThrow("User must be authenticated");
  });

  it("should successfully generate AI haiku", async () => {
    const mockResponse = {
      content: [{text: "Spring rain falling\nCherry blossoms dance gently\nLife begins anew"}],
    };

    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const request = {
      auth: {uid: "test-user-id"},
      data: {theme: "spring"},
    };

    const result = await generateAIHaiku.run(request);

    expect(result).toEqual({
      haiku: "Spring rain falling\nCherry blossoms dance gently\nLife begins anew",
      isAI: true,
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-api-key": "test-api-key",
        }),
      })
    );
  });

  it("should handle rate limiting", async () => {
    const request = {
      auth: {uid: "rate-limit-user"},
      data: {theme: "nature"},
    };

    // Make 10 requests to hit rate limit
    for (let i = 0; i < 10; i++) {
      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({
          content: [{text: "test haiku"}],
        }),
      });
      await generateAIHaiku.run(request);
    }

    // 11th request should fail
    await expect(generateAIHaiku.run(request)).rejects.toThrow("Rate limit exceeded");
  });

  it("should sanitize theme input", async () => {
    const mockResponse = {
      content: [{text: "Safe haiku here"}],
    };

    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const request = {
      auth: {uid: "test-user-id"},
      data: {theme: "<script>alert('xss')</script>nature"},
    };

    await generateAIHaiku.run(request);

    const fetchCall = fetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.messages[0].content).toContain("scriptalertxssscriptnature");
    expect(body.messages[0].content).not.toContain("<script>");
  });

  it("should handle API errors gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    const request = {
      auth: {uid: "test-user-id"},
      data: {theme: "nature"},
    };

    await expect(generateAIHaiku.run(request)).rejects.toThrow("Failed to generate haiku");
  });

  it("should handle missing API key", async () => {
    const originalKey = process.env.CLAUDE_API_KEY;
    delete process.env.CLAUDE_API_KEY;

    const request = {
      auth: {uid: "test-user-id"},
      data: {theme: "nature"},
    };

    await expect(generateAIHaiku.run(request)).rejects.toThrow("Claude API key not configured");

    process.env.CLAUDE_API_KEY = originalKey;
  });
});