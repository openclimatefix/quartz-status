import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import ComponentsRouter from "./components";
import { checkJwt, checkScopes } from "./middleware/auth";
import AuthRouter, { unauthorizedErrorMiddleware } from "./components/auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;
const serverUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
process.env.SERVER_URL = serverUrl;

app.set("view engine", "ejs");
app.set("views", "./views");

if (!process.env.SERVER_URL) {
  throw "Make sure you have set the SERVER_URL in the environment.";
}

if (!process.env.AUTH0_ISSUER_BASE_URL || !process.env.AUTH0_AUDIENCE) {
  throw "Make sure you have AUTH0_ISSUER_BASE_URL and AUTH0_AUDIENCE in your .env file";
}

/**
 Global middleware
 - This middleware will be executed for every request to the app
*/
// app.use(function (req, res, next) {
//   console.log("middleware");
//   return next();
// });

/**
 Routes
  - These route handlers will be executed from the root path of the app
  - They can be used to define general routes, such as health checks
  - Route handlers are separated for testability
*/
export const rootHandler = (req: Request, res: Response) => {
  res.send({ status: "ok", message: "This is the Quartz Status API." });
};
app.get("/", rootHandler);

export const healthHandler = (req: Request, res: Response) => {
  res.send({ status: "ok", message: "Quartz Status API is operating normally." });
};
app.get("/health", healthHandler);

// Admin route example – only accessible to users with the `read:admin` scope in Auth0
export const adminHandler = (req: Request, res: Response) => {
  res.send({
    status: "ok",
    message: "Admin API is working and authorized behind the read:admin scope."
  });
};
app.get("/admin", checkJwt, checkScopes, adminHandler);

/**
 * Mount the components router on the `/components` path
 * This will allow us to define routes for the various components
 * in separate files, and mount them all under the `/components` path
 * in the app.
 */
app.use("/components", ComponentsRouter);

/**
 * As above for Auth routes, e.g. login, logout, callback
 */
app.use("/auth", AuthRouter);

// WebSockets
// const expressWs: Instance = express_ws(app);
// expressWs.app.ws("/ws", function (ws) {
//   ws.on("message", function (msg) {
//     console.log(msg);
//   });
//   ws.on("connection", function (connection) {
//     console.log("Connected");
//     console.log(connection);
//   });
// console.log('socket', req.testing);
// });

// Favicon
app.use("/favicon.ico", express.static("./favicon.ico"));

// Custom unauthorized error handler with messages for expected Auth0 errors
app.use(unauthorizedErrorMiddleware);

export { app, port, serverUrl };
