import express from "express";
import authentication from "./auth.js";
import users from "./users.js";
import upload from "./upload.js";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  users(router);
  upload(router);
  return router;
};
