// Test generic other 401 error
import { getMockRequestHandlerObjects } from "../helpers/mockObjects";
import { unauthorizedErrorMiddleware } from "../../../components/auth";
import { parseUserDataFromIdToken } from "../../../components/auth";

describe("Test auth token parsing function", () => {
  it("should return an empty object if no token is given", async () => {
    const token = "";
    const expected = {};
    const result = parseUserDataFromIdToken(token);
    expect(result).toEqual(expected);
  });

  it("should return an empty object if an invalid token is given", async () => {
    const token = "invalid_token";
    const expected = {};
    const result = parseUserDataFromIdToken(token);
    expect(result).toEqual(expected);
  });

  it("should return an object with the email if a token is given", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QG9jZi5vcmciLCJpYXQiOjE1MTYyMzkwMjJ9.SEWDykSlBzo8jAggFbdBalVUt7MIlx3EMdhkhrHGZr0";
    const expected = {
      sub: "1234567890",
      email: "test@ocf.org",
      iat: 1516239022
    };
    const result = parseUserDataFromIdToken(token);
    expect(result).toEqual(expected);
  });
});

describe("Test unspecified auth errors", () => {
  it("should return a status message with a generic 401 error", async () => {
    // Arrange
    const { req, res } = getMockRequestHandlerObjects();
    const expected = {
      status: "error",
      message: "other_error"
    };
    const err = {
      statusCode: 401,
      code: "other_error"
    };
    // Act
    unauthorizedErrorMiddleware(err, req, res, jest.fn());
    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(expected);
  });

  it("should return a status message with a generic 403 error", async () => {
    // Arrange
    const { req, res } = getMockRequestHandlerObjects();
    const expected = {
      status: "error",
      message: "other_error"
    };
    const err = { statusCode: 403, code: "other_error" };
    // Act
    unauthorizedErrorMiddleware(err, req, res, jest.fn());
    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith(expected);
  });
});
