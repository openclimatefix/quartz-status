import express from "express";
import { checkECMWF } from "./ecmwf";
import { checkMetOffice } from "./metOffice";
import { checkEUMETSAT } from "./eumetsat";
import { Tspec } from "tspec";
import { RouteResponse } from "../../types";

const ProviderCheckRouter = express.Router();

export type ProviderStatus = "ok" | "warning" | "error" | "unknown";
export type ProviderStatusResponse = {
  provider: string;
  source: string;
  status: ProviderStatus;
  statusMessage: string;
  url: string;
  statusPageUrl: string;
  details?: any;
  error?: string;
};

/**
 * Data API specification for checking the status of data providers.
 */
export type DataApiSpec = Tspec.DefineApiSpec<{
  tags: ["Data"];
  paths: {
    "/data/providers": {
      get: {
        summary: "Data providers status check";
        description: "Check the status of various data providers.";
        responses: RouteResponse<ProviderStatusResponse[]>;
      };
    };
  };
}>;

ProviderCheckRouter.get("/", async (req, res) => {
  const results: ProviderStatusResponse[] = await Promise.all([
    checkECMWF(),
    checkMetOffice(),
    checkEUMETSAT()
  ]);
  res.json(results);
});

ProviderCheckRouter.get("/ecmwf", async (req, res) => {
  const result: ProviderStatusResponse = await checkECMWF();
  res.json(result);
});

ProviderCheckRouter.get("/metoffice", async (req, res) => {
  const result: ProviderStatusResponse = await checkMetOffice();
  res.json(result);
});

ProviderCheckRouter.get("/eumetsat", async (req, res) => {
  const { verbose } = req.query;
  const result: ProviderStatusResponse = await checkEUMETSAT(verbose === "true");
  res.json(result);
});

export default ProviderCheckRouter;
