import { app, port, serverUrl } from "./app";

app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port} at ${serverUrl}`);
});
