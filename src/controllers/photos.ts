import express from "express";
import convert from "heic-convert";
import ExifReader from "exifreader";
import { getSPhotoFromS3, uploadSPhotoToS3 } from "../aws/s3.js";
import { log } from "../utils/logger.js";
import { processEXIF } from "../utils/imageExifProcess.js";

export const uploadPhoto = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { title, description, date, rotate } = req.body;
    const image = req.file;
    const newJpeg = await processEXIF(image, {
      title,
      description,
      date,
      rotate,
    });

    const EXIFnewJPEG = ExifReader.load(newJpeg.buffer);
    const photo = await uploadSPhotoToS3(newJpeg, title ?? image.originalname);
    const signedPhoto = await getSPhotoFromS3(title ?? image.originalname);

    return res.status(200).json({
      message: "File uploaded successfully!",
      signedUrl: signedPhoto,
      $EXIF: EXIFnewJPEG,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
