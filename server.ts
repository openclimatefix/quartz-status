/**
 * Entry point of the server
 * Keeping this separate from the express app means we can test the app without starting the server
 */
import { app, port, serverUrl } from "./app";
import { Tspec, generateTspec } from "tspec";
import swaggerUi from "swagger-ui-express";

const tspecParams: Tspec.GenerateParams = {
  outputPath: "./openapi.json",
  openapi: {
    title: "Status API",
    version: "0.1.0",
    description:
      `API documentation for the Quartz Status API.\n` +
      `The OpenAPI Spec can be found at [/openapi.json](${serverUrl}/openapi.json).`,
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
  // programmatically generate openapi spec using Tspec
  const openApiSpec = await generateTspec(tspecParams);
  // serve the openapi spec
  app.get("/openapi.json", (req, res) => {
    res.json(openApiSpec);
  });
  // serve the openapi spec and swagger UI
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      swaggerUrl: "/openapi.json",
      swaggerOptions: {
        // docExpansion: "none",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        url: `${serverUrl}/openapi.json`,
        serverUrl: {
          url: `${serverUrl}/openapi.json`,
          description: "Server URL"
        }
      },
      customfavIcon: "https://quartz.solar/favicon.ico",
      customSiteTitle: "Quartz Status API Documentation",
      customCss:
        "html { -webkit-font-smoothing: antialiased; }" +
        ".swagger-ui .topbar { background-color: #f8f9fa; } \n" +
        ".topbar-wrapper {" +
        "    justify-content: center;\n" +
        "    padding: 1rem 0.5rem;" +
        "}" +
        ".topbar-wrapper .link {" +
        "    content:url('/quartz_logo.svg');\n" +
        "}"
    })
  );
  app.listen(port, () => {
    console.log(`[server]: Server is running on port ${port} at ${serverUrl}`);
  });
};

initServer();
