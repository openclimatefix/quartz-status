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

describe("GET /regions/GB/apis/sites/status", () => {
  it("should return a 200 status", async () => {
    // Mock the fetch function to return a 200 status
    jest.spyOn(global, "fetch").mockResolvedValue({
      status: 200,
      json: async () => ({ status: "ok", message: "" })
    } as Response);
    const response = await request(app).get("/regions/GB/apis/sites/status");
    console.log("response", response.body);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.message).toBe("Forecast operating within normal parameters");
  });
  it("should return a 500 status if the UK_PV_SITE_API_URL is not set", async () => {
    process.env.UK_PV_SITE_API_URL = "";
    const response = await request(app).get("/regions/GB/apis/sites/status");
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("UK_PV_SITE_API_URL is not set");
  });
  it("should return a 500 status if the fetch fails", async () => {
    // Mock the fetch function to throw an error
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("Failed to fetch status"));
    const response = await request(app).get("/regions/GB/apis/sites/status");
    expect(response.status).toBe(500);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe(
      `Failed to fetch status of ${process.env.UK_PV_SITE_API_URL}`
    );
  });
  it("should return a non-200 status if the fetch response is not successful", async () => {
    // Mock the fetch function to return a non-200 status
    jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ status: 400, statusText: "Bad Request" } as Response);
    const response = await request(app).get("/regions/GB/apis/sites/status");
    expect(response.status).toBe(400);
    expect(response.body.status).toBe(400);
    expect(response.body.message).toBe("Bad Request");
  });
});
