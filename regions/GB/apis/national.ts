/**
 * Configures route handlers for the UK PV National API checks.
 * This module exports an Express router instance, which can be mounted
 * in the main API router.
 */
import express, { Response } from "express";
import { RouteResponse, StatusMessageResponse } from "../../../types";
import { Tspec } from "tspec";
import { GBAPIPaths } from "./paths";

const UkNationalRouter = express.Router();

UkNationalRouter.get("/status", async (req, res: Response<StatusMessageResponse>) => {
  // Get the API URL from the environment and check if it is set
  const nationalApiUrl = process.env.UK_PV_NATIONAL_API_URL;
  if (!nationalApiUrl) {
    res.status(500).send({
      status: "error",
      message: "UK_PV_NATIONAL_API_URL is not set"
    });
    return;
  }

  // Get solar status from the API
  try {
    const solarStatusResponse = await fetch(`${nationalApiUrl}/v0/solar/GB/status`);
    // Check if the response is successful, and if not, send an error message
    if (solarStatusResponse.status !== 200) {
      res.status(solarStatusResponse.status).send({
        status: solarStatusResponse.status,
        message: solarStatusResponse.statusText
      });
      return;
    }

    // If the response is successful, parse the JSON and send the success message
    const solarStatusResponseJson = await solarStatusResponse.json();
    res.send({
      status: solarStatusResponseJson.status || "ok",
      message: solarStatusResponseJson.message || "Forecast operating within normal parameters"
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: `Failed to fetch status of ${nationalApiUrl}`
    });
    return;
  }
});

UkNationalRouter.get("/recent-forecast", async (req, res: Response<StatusMessageResponse>) => {
  // Get the API URL from the environment and check if it is set
  const nationalApiUrl = process.env.UK_PV_NATIONAL_API_URL;
  if (!nationalApiUrl) {
    res.status(500).send({
      status: "error",
      message: "UK_PV_NATIONAL_API_URL is not set"
    });
    return;
  }

  const { "time-window": timeWindow } = req.query; // Time window should be 30, 60 or 120 minutes for now
  const timeWindowMinutes = timeWindow ? Number(timeWindow) : 120; // Default to 120 minutes
  let timeWindowString;
  switch (timeWindowMinutes) {
    case 30:
      timeWindowString = "30 minutes";
      break;
    case 60:
      timeWindowString = "1 hour";
      break;
    case 120:
      timeWindowString = "2 hours";
      break;
    default:
      res.status(400).send({
        status: "error",
        message: "Invalid time window. Please use 30, 60 or 120 minutes"
      });
      return;
  }

  try {
    // Get solar status from the API
    const recentForecastResponse = await fetch(
      `${nationalApiUrl}/v0/solar/GB/check_last_forecast_run`
    );

    // Check if the response is successful, and if not, send an error message
    if (recentForecastResponse.status !== 200) {
      res.status(recentForecastResponse.status).send({
        status: recentForecastResponse.status,
        message: recentForecastResponse.statusText
      });
      return;
    }

    // If the response is successful, parse the JSON and send the success message
    // Should return the latest forecast run time as an ISO string
    const latestForecastRunDatestamp = await recentForecastResponse.json();

    // Determine if the latest forecast run is within the time window
    const latestForecastRunDate = new Date(latestForecastRunDatestamp);
    // Check the latest forecast datetime is valid
    if (isNaN(latestForecastRunDate.getTime())) {
      res.status(500).send({
        status: "error",
        message: "Failed to parse the latest forecast run date"
      });
      return;
    }
    const now = new Date();
    const timeDifference = now.getTime() - latestForecastRunDate.getTime();
    const timeDifferenceMinutes = timeDifference / (1000 * 60);
    const response = {
      status: "ok",
      message: `Latest forecast run within past ${timeWindowString}`
    };
    if (timeDifferenceMinutes > timeWindowMinutes) {
      response.status = "error";
      response.message = `Latest forecast run outside of past ${timeWindowString}`;
    }

    res.send(response);
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: `Failed to fetch recent forecast data`
    });
  }
});

export type UkNationalApiSpec = Tspec.DefineApiSpec<{
  tags: ["UK National"];
  paths: {
    [GBAPIPaths.GBNationalStatusPath]: {
      get: {
        summary: "UK National Solar API status";
        description: "Check the status of the UK National Solar API.";
        responses: RouteResponse<StatusMessageResponse>;
      };
    };
    [GBAPIPaths.GBNationalRecentForecastPath]: {
      get: {
        summary: "UK National Solar API recent forecast";
        description: "Check the time of the most recent forecast run.";
        query: {
          "time-window"?: string;
        };
        responses: RouteResponse<StatusMessageResponse>;
      };
    };
  };
}>;

export default UkNationalRouter;
