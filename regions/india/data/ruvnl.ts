/**
 * Configures route handlers for the India data RUVNL checks.
 * This module exports an Express router instance, which can be mounted
 * in the main API router.
 */
import express, { Response } from "express";
import { RouteResponse, StatusMessageResponse } from "../../../types";
import { Tspec } from "tspec";
import { IndiaDataPaths } from "./paths";

const RUVNLRouter = express.Router();

RUVNLRouter.get("/status", async (req, res: Response<StatusMessageResponse>) => {

  const urlRUVNL = "http://sldc.rajasthan.gov.in/rrvpnl/read-sftp?type=overview";

  try {
    // Get solar status from the API
    const urlStatusResponse = await fetch(`${urlRUVNL}`);

    // Check if the response is successful, and if not, send an error message
    if (urlStatusResponse.status !== 200) {
      res.status(urlStatusResponse.status).send({
        status: urlStatusResponse.status,
        message: urlStatusResponse.statusText
      });
      return;
    }

    // If the response is successful, parse the JSON and send the success message
    const urlStatusResponseJson = await urlStatusResponse.json();
    res.send({
      status: urlStatusResponseJson.status || "ok",
      message: urlStatusResponseJson.message || `${urlRUVNL} operating within normal parameters`
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: `Failed to fetch status of ${urlRUVNL}`
    });
  }
});

export type RUVNLSpec = Tspec.DefineApiSpec<{
  tags: ["India Data"];
  paths: {
    [IndiaDataPaths.IndiaDatRUVNLStatusPath]: {
      get: {
        summary: "India RUVNL data status";
        description: "Check the status of the RUVNL";
        responses: RouteResponse<StatusMessageResponse>;
      };
    };
  };
}>;

export default RUVNLRouter;
