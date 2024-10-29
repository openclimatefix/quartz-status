import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import { adminHandler, healthHandler, rootHandler } from "../../app";
import { getMockRequestHandlerObjects } from "./helpers/mockObjects";

describe("Test root level handlers", () => {
  it("should return a status message", () => {
    // Arrange
    const { req, res } = getMockRequestHandlerObjects();
    const expected = { status: "ok", message: "This is the Quartz Status API." };
    // Act
    rootHandler(req, res);
    // Assert
    expect(res.send).toHaveBeenCalledWith(expected);
  });

  it("should return a health message", async () => {
    // Arrange
    const { req, res } = getMockRequestHandlerObjects();
    const expected = { status: "ok", message: "Quartz Status API is operating normally." };
    // Act
    healthHandler(req, res);
    // Assert
    expect(res.send).toHaveBeenCalledWith(expected);
  });

  // Assumes that we have passed the checkJwt and checkScopes middleware
  it("should return an admin message", async () => {
    // Arrange
    const { req, res } = getMockRequestHandlerObjects();
    const expected = {
      status: "ok",
      message: "Admin API is working and authorized behind the read:admin scope."
    };
    // Act
    adminHandler(req, res);
    // Assert
    expect(res.send).toHaveBeenCalledWith(expected);
  });
});
