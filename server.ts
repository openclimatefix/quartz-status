/**
 * Entry point of the server
 * Keeping this separate from the express app means we can test the app without starting the server
 */
import { app, port, serverUrl } from "./app";
import { Tspec, TspecDocsMiddleware } from "tspec";

const tspecParams: Tspec.GenerateParams = {
  openapi: {
    title: "Quartz Status API",
    version: "0.1.0",
    description: "This is the API documentation for the Quartz Status API.",
    securityDefinitions: {
      jwt: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};
const initServer = async () => {
  app.use("/docs", await TspecDocsMiddleware(tspecParams));
  app.listen(port, () => {
    console.log(`[server]: Server is running on port ${port} at ${serverUrl}`);
  });
};

initServer();
