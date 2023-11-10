import express from "express";
import ExifReader from "exifreader";
import { getSPhotoFromS3, uploadSPhotoToS3 } from "../aws/s3.js";
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

    const photoID = EXIFnewJPEG.DateTimeOriginal.description.split(" ");
    photoID[0].replaceAll(":", "-");
    const photoTitle = title ?? image.originalname;
    const photoKey = photoTitle.slice(0, photoTitle.indexOf("."));

    const photo = await uploadSPhotoToS3(
      newJpeg,
      photoKey + "T" + photoID.join(" ") + ".jpg"
    );
    const signedPhoto = await getSPhotoFromS3(photoKey);

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

export const deletePhoto = async (
  req: express.Request,
  res: express.Response
) => {
  try {
  } catch (error) {}
};
