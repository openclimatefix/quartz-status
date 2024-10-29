/**
 * Entry point of the server
 * Keeping this separate from the express app means we can test the app without starting the server
 */
import { app, port, serverUrl } from "./app";

app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port} at ${serverUrl}`);
});
