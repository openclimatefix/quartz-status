/**
 * This module sets up an Express router for the API component routes.
 * It imports each individual API router, and mounts them on their respective paths,
 * e.g. the `UkNationalRouter` router mounts to `/uk-national` path.
 */
import express from "express";
import UkNationalRouter from "./uk-national";
import UkSitesRouter from "./uk-sites";

const APIsRouter = express.Router();
APIsRouter.use("/uk-national", UkNationalRouter);
APIsRouter.use("/uk-sites", UkSitesRouter);

export default APIsRouter;
