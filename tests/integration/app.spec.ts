import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import request from "supertest";
import supertest from "supertest";
import { app } from "../../app";

describe("GET /", () => {
  it("should return a 200 status", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});

describe("GET /health", () => {
  it("should return a 200 status for the health check", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
  });
});

describe("GET /admin", () => {
  it("should not return a 200 status without auth", async () => {
    const response = await request(app).get("/admin");
    expect(response.status).toBe(401);
    const responseJson = response.body;
    expect(responseJson.status).toBe("error");
    expect(responseJson.message).toBe(
      "Unauthorized: please provide a valid token to access this resource."
    );
  });

  it("should return a 401 status message with an invalid Bearer token", async () => {
    const response = await request(app).get("/admin").set("Authorization", "Bearer test");
    expect(response.status).toBe(401);
    const responseJson = response.body;
    expect(responseJson.status).toBe("error");
    expect(responseJson.message).toBe("Unauthorized: invalid token.");
  });
  it("should return a 401 status message with an invalid scope", async () => {
    // Fetch token from Auth0 using test user credentials
    const response = await request(`${process.env.AUTH0_ISSUER_BASE_URL}`)
      .post("/oauth/token")
      .send({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: process.env.AUTH0_AUDIENCE,
        grant_type: "password",
        username: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASSWORD,
        scope: "read:admin" // This is the scope we are testing, but this user does not have it
      });
    expect(response.status).toBe(200);
    const token = response.body.access_token;

    // Make a request to the /admin endpoint with the token
    const request1 = supertest(app);
    const response1 = await request1.get("/admin").set("Authorization", `Bearer ${token}`);
    expect(response1.status).toBe(403);
    const responseJson = response1.body;
    expect(responseJson.status).toBe("error");
    expect(responseJson.message).toBe(
      "Forbidden: insufficient scope – you must be an admin to access this resource."
    );
  });
  it("should return a 200 status message with a valid admin Bearer token", async () => {
    // Fetch token from Auth0 using test user credentials
    const response = await request(`${process.env.AUTH0_ISSUER_BASE_URL}`)
      .post("/oauth/token")
      .send({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: process.env.AUTH0_AUDIENCE,
        grant_type: "password",
        username: process.env.TEST_ADMIN_USER_EMAIL,
        password: process.env.TEST_ADMIN_USER_PASSWORD,
        scope: "read:admin"
      });
    expect(response.status).toBe(200);
    const token = response.body.access_token;

    // Make a request to the /admin endpoint with the token
    const request1 = supertest(app);
    const response1 = await request1.get("/admin").set("Authorization", `Bearer ${token}`);
    expect(response1.status).toBe(200);
    const responseJson = response1.body;
    expect(responseJson.status).toBe("ok");
    expect(responseJson.message).toBe(
      "Admin API is working and authorized behind the read:admin scope."
    );
  });
});

describe("websockets", () => {
  it("should return a 200 status", async () => {
    const ws = supertest(app);
    const response = await ws.get("/ws");
    expect(response.status).toBe(200);
  });
});
