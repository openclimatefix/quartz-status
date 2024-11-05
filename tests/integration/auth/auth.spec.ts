import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import request from "supertest";
import { app } from "../../../app";
import * as authFunctions from "../../../auth";

afterEach(() => {
  jest.restoreAllMocks();
});

const URLsToTest = {
  login: "/auth/login",
  callback: "/auth/callback"
};

describe(`GET ${URLsToTest.login}`, () => {
  it("should return a 302 Redirect status", async () => {
    const response = await request(app).get(URLsToTest.login);
    const serverURL = process.env.SERVER_URL || "";
    // Hardcoded URL with test values encoded
    const url = `https://quartz-test.eu.auth0.com/authorize?response_type=code&scope=openid+profile+email+read%3Aadmin&client_id=J7D4WAawMBB9Ijl7GMuS719fE1IqUU0c&redirect_uri=${encodeURIComponent(serverURL)}%2Fauth%2Fcallback&audience=https%3A%2F%2Fquartz-test`;
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(url);
  });
  π;
});

describe(`GET ${URLsToTest.callback}`, () => {
  it("should return a 500 status if no access token is found", async () => {
    const response = await request(app).get(`${URLsToTest.callback}?code=123`);
    expect(response.status).toBe(500);
    expect(response.text).toBe("Error fetching access token.");
  });
  it("should return a 400 status if no code is provided", async () => {
    const response = await request(app).get(URLsToTest.callback);
    expect(response.status).toBe(400);
    expect(response.text).toBe("Missing or invalid code parameter.");
  });
  it("should return a 500 status if an error occurs while fetching the access token", async () => {
    jest.spyOn(authFunctions, "getAccessTokenUsingCode").mockRejectedValue(new Error("Test error"));
    const response = await request(app).get(`${URLsToTest.callback}?code=12345`);
    expect(response.status).toBe(500);
    expect(response.text).toBe("Error getting access token.");
  });
  it("should return a 500 status if an error occurs while parsing email from token.", async () => {
    const access_token = "eyTestTestTest";
    const id_token = "eyTestTestTest";
    jest
      .spyOn(authFunctions, "getAccessTokenUsingCode")
      .mockResolvedValue({ access_token, id_token });
    jest.spyOn(authFunctions, "parseUserDataFromIdToken").mockReturnValue({});
    const response = await request(app).get(`${URLsToTest.callback}?code=12345`);
    expect(response.status).toBe(500);
    expect(response.text).toBe("Error parsing email from token.");
  });
  it("should return a 200 status if an access token is found", async () => {
    // stub the getAccessTokenUsingCode function
    const access_token = "eyTestTestTest";
    const id_token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QG9jZi5vcmciLCJpYXQiOjE1MTYyMzkwMjJ9.SEWDykSlBzo8jAggFbdBalVUt7MIlx3EMdhkhrHGZr0";
    jest
      .spyOn(authFunctions, "getAccessTokenUsingCode")
      .mockResolvedValue({ access_token, id_token });
    const response = await request(app).get(`${URLsToTest.callback}?code=12345`);
    expect(response.status).toBe(200);
    expect(response.text).toContain("A fresh auth token has been successfully created");
    expect(response.header["content-type"]).toBe("text/html; charset=utf-8");
  });
});
