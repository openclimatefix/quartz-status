import express from "express";
import { checkECMWF } from "./ecmwf";
import { checkMetOffice } from "./metOffice";
import { checkEUMETSAT } from "./eumetsat";

const ProviderCheckRouter = express.Router();

export type ProviderStatus = "ok" | "warning" | "error" | "unknown";
export type ProviderStatusResponse = {
  provider: string;
  source: string;
  status: ProviderStatus;
  statusMessage: string;
  details?: any;
  error?: string;
};

ProviderCheckRouter.get("/", async (req, res) => {
  const results: ProviderStatusResponse[] = await Promise.all([
    checkECMWF(),
    checkMetOffice(),
    checkEUMETSAT()
  ]);
  res.json(results);
});

export default ProviderCheckRouter;
