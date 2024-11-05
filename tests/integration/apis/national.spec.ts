import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import request from "supertest";
import { app } from "../../../app";

const ORIGINAL_ENV = process.env;

afterEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

describe("GET /regions/GB/apis/national/status", () => {
  it("should return a 200 status", async () => {
    const response = await request(app).get("/regions/GB/apis/national/status");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.message).toBe("Forecast operating within normal parameters");
  });
  it("should return a 500 status if the UK_PV_NATIONAL_API_URL is not set", async () => {
    process.env.UK_PV_NATIONAL_API_URL = "";
    const response = await request(app).get("/regions/GB/apis/national/status");
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("UK_PV_NATIONAL_API_URL is not set");
  });
  it("should return a 500 status if the fetch fails", async () => {
    process.env.UK_PV_NATIONAL_API_URL = "https://api.example.com";
    const response = await request(app).get("/regions/GB/apis/national/status");
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Failed to fetch status of https://api.example.com");
  });
  it("should return a non-200 status if the fetch response is not successful", async () => {
    // Mock the fetch function to return a non-200 status
    jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ status: 400, statusText: "Bad Request" } as Response);
    const response = await request(app).get("/regions/GB/apis/national/status");
    expect(response.status).toBe(400);
    expect(response.body.status).toBe(400);
    expect(response.body.message).toBe("Bad Request");
  });
});

describe("GET /regions/GB/apis/national/recent-forecast", () => {
  it("should return a 200 status and correct default message", async () => {
    const response = await request(app).get("/regions/GB/apis/national/recent-forecast");
    console.log("response", response.body);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.message).toBe("Latest forecast run within past 2 hours");
  });
  it("should return a 500 status if the UK_PV_NATIONAL_API_URL is not set", async () => {
    process.env.UK_PV_NATIONAL_API_URL = "";
    const response = await request(app).get("/regions/GB/apis/national/recent-forecast");
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("UK_PV_NATIONAL_API_URL is not set");
  });
  it("should return a 500 status if the API response is not successful", async () => {
    process.env.UK_PV_NATIONAL_API_URL = "https://api.example.com";
    const response = await request(app).get("/regions/GB/apis/national/recent-forecast");
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Failed to fetch recent forecast data");
  });
  it("should return a 400 status if an invalid time window is provided", async () => {
    const response = await request(app).get(
      "/regions/GB/apis/national/recent-forecast?time-window=15"
    );
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Invalid time window. Please use 30, 60 or 120 minutes");
  });
  it("should return a 200 status and correct message for a 30-minute time window", async () => {
    const response = await request(app).get(
      "/regions/GB/apis/national/recent-forecast?time-window=30"
    );
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.message).toBe("Latest forecast run within past 30 minutes");
  });
  it("should return a 200 status and correct message for a 60-minute time window", async () => {
    const response = await request(app).get(
      "/regions/GB/apis/national/recent-forecast?time-window=60"
    );
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.message).toBe("Latest forecast run within past 1 hour");
  });
  it("should return a 200 status and correct message for a 120-minute time window", async () => {
    const response = await request(app).get(
      "/regions/GB/apis/national/recent-forecast?time-window=120"
    );
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.message).toBe("Latest forecast run within past 2 hours");
  });
  it("should return a 500 status if the API response is not successful", async () => {
    // Mock the fetch function to return an error
    jest.spyOn(global, "fetch").mockRejectedValue("Failed to fetch");
    const response = await request(app).get(
      "/regions/GB/apis/national/recent-forecast?time-window=120"
    );
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Failed to fetch recent forecast data");
  });
  it("should return a 500 status if the API response does not have a status", async () => {
    // Mock the fetch function to return an empty response
    jest.spyOn(global, "fetch").mockRejectedValue("error");
    const response = await request(app).get(
      "/regions/GB/apis/national/recent-forecast?time-window=120"
    );
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Failed to fetch recent forecast data");
  });
  it("should return the returned status code if the API response status is not 200", async () => {
    // Mock the fetch function to return a non-200 status
    jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ status: 400, statusText: "Bad Request" } as Response);
    const response = await request(app).get(
      "/regions/GB/apis/national/recent-forecast?time-window=120"
    );
    expect(response.status).toBe(400);
    expect(response.body.status).toBe(400);
    expect(response.body.message).toBe("Bad Request");
  });
  it("should return a 200 status with correct error if the latest forecast run is outside the time window", async () => {
    // Mock the fetch function to return a date 3 hours ago
    jest.spyOn(global, "fetch").mockResolvedValue({
      status: 200,
      json: async () => new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    } as Response);
    const response = await request(app).get(
      "/regions/GB/apis/national/recent-forecast?time-window=120"
    );
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Latest forecast run outside of past 2 hours");
  });
  it("should return a 400 status if the latest forecast run date is not a valid date", async () => {
    // Mock the fetch function to return an invalid date
    jest.spyOn(global, "fetch").mockResolvedValue({
      status: 200,
      json: async () => "invalid date"
    } as Response);
    const response = await request(app).get(
      "/regions/GB/apis/national/recent-forecast?time-window=120"
    );
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Failed to parse the latest forecast run date");
  });
});
