import { uploadPhoto } from "../controllers/photos.js";
import express from "express";
import multer from "multer";

const upload = multer();

export default (router: express.Router) => {
  router.post("/upload/photo", upload.single("image"), uploadPhoto);
};
