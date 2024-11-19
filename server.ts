/**
 * Entry point of the server
 * Keeping this separate from the express app means we can test the app without starting the server
 */
import { initServer } from "./app";

initServer();
