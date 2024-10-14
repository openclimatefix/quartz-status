/**
 * This module sets up an Express router for the various component routes.
 * It imports each individual component router, and mounts them on their respective paths,
 * e.g. the `APIsRouter` router mounts to `/apis` path.
 */
import express from "express";
import APIsRouter from "./apis";

const ComponentsRouter = express.Router();

ComponentsRouter.use("/apis", APIsRouter);

ComponentsRouter.get("/", (req, res) => {
  res.send("Components");
});

export default ComponentsRouter;
