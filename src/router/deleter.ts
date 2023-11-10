import { deletePhoto, uploadPhoto } from "../controllers/photos.js";
import { isAuthenticated, isOwner } from "../middlewares/index.js";
import express from "express";

export default (router: express.Router) => {
  router.delete(
    "/delete/photo/:id/:key",
    isAuthenticated,
    isOwner,
    deletePhoto
  );
};
