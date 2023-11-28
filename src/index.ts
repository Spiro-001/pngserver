import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import "dotenv/config";
import { log } from "./utils/logger.js";
import router from "./router/index.js";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://evil-lemons-fetch.loca.lt"],
  })
);
app.use(compression());
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(parseInt(process.env.SERVER_PORT), () => {
  log(
    `Server running on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`,
    ["bgWhite"],
    ["italic", "bold"]
  );
  if (process.env.LOADED_ENV) {
    log(".env file loaded", ["yellow"]);
  } else {
    log("There was an error loading .env variables", ["red"]);
    log("Environment variables will not be loaded", ["red"]);
    log(
      "Ensure that dotenv is imported and or file exist with variable LOADED_ENV=1",
      ["red"]
    );
  }
});

app.use("/", router());
