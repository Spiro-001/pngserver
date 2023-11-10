import express from "express";
import ExifReader from "exifreader";
import lodash from "lodash";
import {
  deleteSPhotoFromS3,
  getSPhotoFromS3,
  uploadSPhotoToS3,
} from "../aws/s3.js";
import { processEXIF } from "../utils/imageExifProcess.js";
import { getUserBySessionToken } from "../../prisma/users.js";

export const uploadPhoto = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const currentUserId = lodash.get(req, "identity.id") as string;
    if (!currentUserId) {
      return res
        .status(403)
        .json({ message: "Could not resolve your identity!" });
    }

    const { title, description, date, rotate } = req.body;
    const image = req.file;
    if (!image) {
      return res.status(400).json({ message: "File was not attached!" });
    }
    const newJpeg = await processEXIF(image, {
      title,
      description,
      date,
      rotate,
    });

    const EXIFnewJPEG = ExifReader.load(newJpeg.buffer);

    const photoID = EXIFnewJPEG.DateTimeOriginal.description.split(" ");
    photoID[0].replaceAll(":", "-");
    const photoTitle = title ?? image.originalname;
    const photoEXTRemoval = photoTitle.slice(0, photoTitle.indexOf("."));
    const photoKey =
      currentUserId +
      "/" +
      photoEXTRemoval +
      "TZ" +
      photoID.join("TTZ") +
      ".jpg";

    const photo = await uploadSPhotoToS3(newJpeg, photoKey);
    const signedPhoto = await getSPhotoFromS3(photoKey);

    return res.status(200).json({
      message: "File uploaded successfully!",
      id: photoKey,
      signedUrl: signedPhoto,
      $EXIF: EXIFnewJPEG,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const deletePhoto = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id, key } = req.params;
    const currentUserId = lodash.get(req, "identity.id") as string;
    if (!currentUserId) {
      return res
        .status(403)
        .json({ message: "Could not resolve your identity!" });
    }
    const photoKey = currentUserId + "/" + key + ".jpg";
    const deletedPhoto = await deleteSPhotoFromS3(photoKey);

    return res.status(200).json({
      message: "File deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
