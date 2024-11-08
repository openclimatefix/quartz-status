/**
 * This module sets up an Express router for the various component routes.
 * It imports each individual component router, and mounts them on their respective paths,
 * e.g. the `APIsRouter` router mounts to `/apis` path.
 */
import express from "express";
import APIsRouter from "./GB/apis";
import DataRouter from "./india/data";

const RegionsRouter = express.Router();

RegionsRouter.use("/GB/apis", APIsRouter);
RegionsRouter.use("/india/data", DataRouter);

export default RegionsRouter;
