const {generateHashtags} = require("../index");

describe("generateHashtags", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication", async () => {
    const request = {
      auth: null,
      data: {content: "Cherry blossoms fall"},
    };

    await expect(generateHashtags.run(request)).rejects.toThrow("User must be authenticated");
  });

  it("should require content", async () => {
    const request = {
      auth: {uid: "test-user-id"},
      data: {},
    };

    await expect(generateHashtags.run(request)).rejects.toThrow("Content is required");
  });

  it("should return base hashtags for generic content", async () => {
    const request = {
      auth: {uid: "test-user-id"},
      data: {content: "A quiet moment here"},
    };

    const result = await generateHashtags.run(request);

    expect(result).toContain("#haiku");
    expect(result).toContain("#poetry");
    expect(result).toContain("#mindfulness");
  });

  it("should include sanitized theme as hashtag", async () => {
    const request = {
      auth: {uid: "test-user-id"},
      data: {content: "A quiet moment here", theme: "Nature Walk"},
    };

    const result = await generateHashtags.run(request);

    expect(result).toContain("#naturewalk");
  });

  it("should sanitize theme input, removing special characters", async () => {
    const request = {
      auth: {uid: "test-user-id"},
      data: {content: "A quiet moment here", theme: "<script>bad</script>"},
    };

    const result = await generateHashtags.run(request);

    // Special chars stripped, only alphanumeric remains
    expect(result).toContain("#scriptbadscript");
    expect(result).not.toContain("<");
  });

  it("should extract nature keywords from content", async () => {
    const request = {
      auth: {uid: "test-user-id"},
      data: {content: "The river flows gently"},
    };

    const result = await generateHashtags.run(request);

    expect(result).toContain("#river");
  });

  it("should add seasonal hashtags based on content", async () => {
    const request = {
      auth: {uid: "test-user-id"},
      data: {content: "Cold frost covers all"},
    };

    const result = await generateHashtags.run(request);

    expect(result).toContain("#winter");
  });

  it("should deduplicate hashtags", async () => {
    const request = {
      auth: {uid: "test-user-id"},
      data: {content: "Cherry blossom bloom", theme: "cherry"},
    };

    const result = await generateHashtags.run(request);

    const cherryCount = result.filter((h) => h === "#cherry").length;
    expect(cherryCount).toBeLessThanOrEqual(1);
  });

  it("should limit results to 5 hashtags", async () => {
    const request = {
      auth: {uid: "test-user-id"},
      data: {
        content: "Cherry blossom moon mountain river ocean forest snow",
        theme: "nature",
      },
    };

    const result = await generateHashtags.run(request);

    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("should not include empty theme as hashtag", async () => {
    const request = {
      auth: {uid: "test-user-id"},
      data: {content: "A quiet moment here", theme: "!!!"},
    };

    const result = await generateHashtags.run(request);

    // Theme "!!!" after sanitization becomes empty string, should not be added
    expect(result).not.toContain("#");
    expect(result.every((h) => h.length > 1)).toBe(true);
  });
});
