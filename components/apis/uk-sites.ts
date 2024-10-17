/**
 * Configures route handlers for the UK PV National API checks.
 * This module exports an Express router instance, which can be mounted
 * in the main API router.
 */
import express from "express";

const UkSitesRouter = express.Router();

UkSitesRouter.get("/status", async (req, res) => {
  // Get the API URL from the environment and check if it is set
  const sitesApiUrl = process.env.UK_SITES_URL;
  if (!sitesApiUrl) {
    res.status(500).send({
      status: "error",
      message: "UK_SITES_URL is not set"
    });
    return;
  }

  // Get solar status from the API
  const solarStatusResponse = await fetch(`${sitesApiUrl}/api_status`);

  // Check if the response is successful, and if not, send an error message
  if (!solarStatusResponse?.status) {
    res.status(500).send({
      status: "error",
      message: `Failed to ping ${sitesApiUrl}`
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

export default UkSitesRouter;
