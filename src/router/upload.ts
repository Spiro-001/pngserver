import { uploadPhoto } from "../controllers/photos.js";
import { isAuthenticated, isOwner } from "../middlewares/index.js";
import express from "express";
import multer from "multer";

const upload = multer();

export default (router: express.Router) => {
  router.post(
    "/upload/photo",
    isAuthenticated,
    upload.single("image"),
    uploadPhoto
  );

  router.post(
    "/upload/photos",
    isAuthenticated,
    upload.array("images"),
    uploadPhoto
  );
};
