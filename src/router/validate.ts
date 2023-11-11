import { validate } from "../controllers/authentication.js";
import express from "express";

export default (router: express.Router) => {
  router.post("/auth/validate", validate);
};
