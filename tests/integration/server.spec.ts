import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

const ORIGINAL_ENV = { ...process.env };

describe("Test initServer & check ENV variables", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });
  it("should throw an error if the SERVER_URL is not set", async () => {
    // Arrange
    process.env.SERVER_URL = "";
    // Act
    try {
      const server = await import("../../app");
      await server.initServer();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Make sure you have set the SERVER_URL in the environment.");
    }
  });
  it("should throw an error if the AUTH0_ISSUER_BASE_URL is not set", async () => {
    // Arrange
    process.env.AUTH0_ISSUER_BASE_URL = "";
    // Act
    try {
      const server = await import("../../app");
      await server.initServer();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        "Make sure you have AUTH0_ISSUER_BASE_URL and AUTH0_AUDIENCE in your .env file"
      );
    }
  });
  it("should throw an error if the AUTH0_AUDIENCE is not set", async () => {
    // Arrange
    process.env.AUTH0_AUDIENCE = "";
    // Act
    try {
      const server = await import("../../app");
      await server.initServer();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        "Make sure you have AUTH0_ISSUER_BASE_URL and AUTH0_AUDIENCE in your .env file"
      );
    }
  });
  it("should not throw an error if the SERVER_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_AUDIENCE are set", async () => {
    // Arrange
    const app = await import("../../app");
    // Act
    const server = await app.initServer();
    // Assert
    expect(app.initServer).not.toThrow();
    expect(server).toBeDefined();
    expect(server).toHaveProperty("listen");
    expect(server).toHaveProperty("close");
    server.close();
  });
});
