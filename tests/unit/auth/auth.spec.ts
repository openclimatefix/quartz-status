// Test generic other 401 error
import { getMockRequestHandlerObjects } from "../helpers/mockObjects";
import { unauthorizedErrorMiddleware, parseUserDataFromIdToken } from "../../../auth";
import * as authFunctions from "../../../auth";

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

describe("Test auth middleware function", () => {
  it("should return a status message with an invalid token error", async () => {
    // Arrange
    const { req, res } = getMockRequestHandlerObjects();
    const expected = {
      status: "error",
      message: "Unauthorized: invalid token."
    };
    const err = { statusCode: 401, code: "invalid_token" };
    // Act
    unauthorizedErrorMiddleware(err, req, res, jest.fn());
    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(expected);
  });
  it("should return a status message with an insufficient scope error", async () => {
    // Arrange
    const { req, res } = getMockRequestHandlerObjects();
    const expected = {
      status: "error",
      message: "Forbidden: insufficient scope – you must be an admin to access this resource."
    };
    const err = { statusCode: 403, code: "insufficient_scope" };
    // Act
    unauthorizedErrorMiddleware(err, req, res, jest.fn());
    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith(expected);
  });
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
  it("should continue to the next middleware if the error is not 401 or 403", async () => {
    // Arrange
    const { req, res } = getMockRequestHandlerObjects();
    const err = { statusCode: 500, code: "other_error" };
    const next = jest.fn();
    // Act
    unauthorizedErrorMiddleware(err, req, res, next);
    // Assert
    expect(next).toHaveBeenCalled();
  });
});

describe("getAccessTokenUsingCode", () => {
  it("should return the access token and id token", async () => {
    const access_token = "eyTestTestTest";
    const id_token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QG9jZi5vcmciLCJpYXQiOjE1MTYyMzkwMjJ9.SEWDykSlBzo8jAggFbdBalVUt7MIlx3EMdhkhrHGZr0";
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ access_token, id_token })
    } as Response);
    const response = await authFunctions.getAccessTokenUsingCode("12345");
    expect(response.access_token).toBe(access_token);
    expect(response.id_token).toBe(id_token);
  });
  it("should return an error if the fetch fails", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue("Failed to fetch");
    await expect(authFunctions.getAccessTokenUsingCode("12345")).rejects.toThrow("Failed to fetch");
  });
});
