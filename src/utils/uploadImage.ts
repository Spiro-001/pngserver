import express from "express";
import ExifReader from "exifreader";
import lodash from "lodash";
import {
  deleteSPhotoFromS3,
  getSPhotoFromS3,
  uploadSPhotoToS3,
} from "../aws/s3.js";
import { processEXIF } from "../utils/imageExifProcess.js";
import {
  createPhoto,
  getPhotosByAlbumId,
  getPhotosByUserId,
} from "../../prisma/photos.js";
import sharp from "sharp";
import { log } from "./logger.js";

export const uploadImage = async (
  req: express.Request,
  res: express.Response,
  currentUserId: string,
  file?: Express.Multer.File,
  current?: number,
  max?: number
) => {
  const { title, description, date, rotate } = req.body;
  const image = file ?? req.file;
  if (!image) {
    return { message: "File was not attached!", key: image.originalname };
  }
  const newJpeg = await processEXIF(image, {
    title,
    description,
    date,
    rotate,
  });

  log(
    `${newJpeg.originalname} has been successfully uploaded! ${
      current ?? 1
    } / ${max ?? 1}`,
    ["blueBright"],
    ["bold"]
  );

  const thumbnail = await sharp(newJpeg.buffer)
    .resize(300, 300)
    .withMetadata()
    .toBuffer();
  // Reuse image object, change the buffer to optimized image buffer
  image.buffer = thumbnail;

  const thumnailFile = await processEXIF(image, {
    title,
    description,
    date,
    rotate,
  });

  const EXIFnewJPEG = ExifReader.load(newJpeg.buffer);
  const dateOriginal =
    EXIFnewJPEG.DateTimeOriginal?.description ?? "1800:01:01 00:00:00";
  const photoID = dateOriginal.split(" ");
  photoID[0] = photoID[0].replaceAll(":", "-");
  const photoTitle = title ?? image.originalname;
  const photoEXTRemoval = photoTitle.slice(0, photoTitle.indexOf("."));
  const photoKey =
    currentUserId + "/" + photoEXTRemoval + "TZ" + photoID.join("TTZ");

  const photo = await uploadSPhotoToS3(newJpeg, photoKey + ".jpg");
  const dbPhoto = await createPhoto(
    currentUserId,
    photoEXTRemoval + "TZ" + photoID.join("TTZ"),
    new Date(photoID.join(" ")).toISOString()
  );
  const thumbnailPhoto = await uploadSPhotoToS3(
    thumnailFile,
    photoKey + "-thumbnail.jpg"
  );
  const signedPhoto = await getSPhotoFromS3(photoKey + ".jpg");
  const signedThumbnailPhoto = await getSPhotoFromS3(
    photoKey + "-thumbnail.jpg"
  );

  return {
    message: "File uploaded successfully",
    id: photoKey,
    signedUrl: {
      m: signedPhoto,
      t: signedThumbnailPhoto,
    },
    $EXIF: EXIFnewJPEG,
  };
};
