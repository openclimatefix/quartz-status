describe("Test getPort function", () => {
  it("should return a port number", async () => {
    // Arrange
    process.env.PORT = "1234";
    const { getPort } = await import("../../app");
    // Act
    const port = getPort();
    // Assert
    expect(port).toBe(1234);
  });
  it("should return a default port number if PORT is not set", async () => {
    // Arrange
    process.env.PORT = "";
    const { getPort } = await import("../../app");
    // Act
    const port = getPort();
    // Assert
    expect(port).toBe(4000);
  });
});
