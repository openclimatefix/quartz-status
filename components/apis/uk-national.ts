/**
 * Configures route handlers for the UK PV National API checks.
 * This module exports an Express router instance, which can be mounted
 * in the main API router.
 */
import express from "express";

const UkNationalRouter = express.Router();

UkNationalRouter.get("/status", async (req, res) => {
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
  const solarStatusResponse = await fetch(`${nationalApiUrl}/v0/solar/GB/status`);

  // Check if the response is successful, and if not, send an error message
  if (!solarStatusResponse?.status) {
    res.status(500).send({
      status: "error",
      message: `Failed to ping ${nationalApiUrl}`
    });
    return;
  } else if (solarStatusResponse.status !== 200) {
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
});

UkNationalRouter.get("/recent-forecast", async (req, res) => {
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

  // Get solar status from the API
  const recentForecastResponse = await fetch(
    `${nationalApiUrl}/v0/solar/GB/check_last_forecast_run`
  );

  // Check if the response is successful, and if not, send an error message
  if (!recentForecastResponse?.status) {
    res.status(500).send({
      status: "error",
      message: `Failed to fetch recent forecast data from ${nationalApiUrl}`
    });
    return;
  } else if (recentForecastResponse.status !== 200) {
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
});

export default UkNationalRouter;
