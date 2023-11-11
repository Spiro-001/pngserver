import { getPhoto, getPhotosById } from "../controllers/photos.js";
import { isAuthenticated, isOwner } from "../middlewares/index.js";
import express from "express";

export default (router: express.Router) => {
  router.get("/get/photo/:id/:type/:key", isAuthenticated, isOwner, getPhoto);
  router.post("/get/photos/:type", isAuthenticated, isOwner, getPhotosById);
};
