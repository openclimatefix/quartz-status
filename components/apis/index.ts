/**
 * This module sets up an Express router for the API component routes.
 * It imports each individual API router, and mounts them on their respective paths,
 * e.g. the `ukPvNationalApi` router mounts to `/uk-pv-national-api` path.
 */
import express from "express";
import ukPvNationalApi from "./uk-pv-national-api";

const APIsRouter = express.Router();
APIsRouter.use("/uk-pv-national-api", ukPvNationalApi);

export default APIsRouter;
