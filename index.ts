import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import express_ws, { Instance } from "express-ws";
import ComponentsRouter from "./components";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

/**
 Global middleware
 - This middleware will be executed for every request to the app
*/
app.use(function (req, res, next) {
  console.log("middleware");
  // req.testing = 'testing';
  return next();
});

/**
 Routes
  - These route handlers will be executed from the root path of the app
*/
app.get("/", (req: Request, res: Response) => {
  res.send({ status: "ok", message: "Quartz API is running." });
});

app.get("/health", (req: Request, res: Response) => {
  res.send({ status: "ok", message: "Quartz Status API is operating normally." });
});

/**
 * Mount the components router on the `/components` path
 * This will allow us to define routes for the various components
 * in separate files, and mount them all under the `/components` path
 * in the app.
 */
app.use("/components", ComponentsRouter);

// WebSockets
const expressWs: Instance = express_ws(app);
expressWs.app.ws("/", function (ws) {
  ws.on("message", function (msg) {
    console.log(msg);
  });
  ws.on("connection", function (connection) {
    console.log("Connected");
    console.log(connection);
  });
  // console.log('socket', req.testing);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
