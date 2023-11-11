import express from "express";
import users from "./users.js";
import upload from "./upload.js";
import deleter from "./deleter.js";
import auth from "./auth.js";
import get from "./get.js";
import validate from "./validate.js";

const router = express.Router();

export default (): express.Router => {
  auth(router);
  users(router);
  upload(router);
  deleter(router);
  get(router);
  validate(router);
  return router;
};
