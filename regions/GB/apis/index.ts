/**
 * This module sets up an Express router for the API component routes.
 * It imports each individual API router, and mounts them on their respective paths,
 * e.g. the `GBNationalRouter` router mounts to `/uk-national` path.
 */
import express from "express";
import GBNationalRouter from "./national";
import GBSitesRouter from "./sites";
import { GBNationalSegment, GBSitesSegment } from "./paths";

const APIsRouter = express.Router();

APIsRouter.use(GBNationalSegment, GBNationalRouter);

APIsRouter.use(GBSitesSegment, GBSitesRouter);

export default APIsRouter;
