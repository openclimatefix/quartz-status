import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Instance } from "express-ws";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const expressWs: Instance = require('express-ws')(app);

app.use(function (req, res, next) {
  console.log('middleware');
  // req.testing = 'testing';
  return next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

expressWs.app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
  ws.on('connection', function(connection) {
    console.log('Connected')
    console.log(connection);
  });
  // console.log('socket', req.testing);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
