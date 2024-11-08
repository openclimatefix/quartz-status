/**
 * This module sets up an Express router for the API component routes.
 * It imports each individual API router, and mounts them on their respective paths,
 * e.g. the `GBNationalRouter` router mounts to `/uk-national` path.
 */
import express from "express";
import RUVNLRouter from "./ruvnl";

const DataRouter = express.Router();

DataRouter.use("/ruvnl", RUVNLRouter);

export default DataRouter;
