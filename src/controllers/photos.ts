import express from "express";
import lodash from "lodash";
import { deleteSPhotoFromS3, getSPhotoFromS3 } from "../aws/s3.js";
import { getPhotosByAlbumId, getPhotosByUserId } from "../../prisma/photos.js";
import { uploadImage } from "../utils/uploadImage.js";
import { log } from "../utils/logger.js";
import { prisma } from "../../prisma/prisma.js";

type ImageResultType = {
  message: string;
  id?: string;
  signedUrl?: {
    m: string;
    t: string;
  };
  $EXIF?: ExifReader.Tags;
  key?: string;
};

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
    // Multiple Files
    if (req.files) {
      const result: ImageResultType[] = [];
      const files = req.files as Express.Multer.File[];
      let idx = 1;
      for (const file of files) {
        const p = await uploadImage(
          req,
          res,
          currentUserId,
          file,
          idx,
          files.length
        );
        result.push(p);
        idx++;
      }
      log("Upload complete!", ["greenBright"], ["bold"]);
      return res.status(200).json({ result });
    } else {
      uploadImage(req, res, currentUserId).then((result) => {
        log("Upload complete!", ["greenBright"], ["bold"]);
        return res.status(200).json(result);
      });
    }
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

export const getPhoto = async (req: express.Request, res: express.Response) => {
  try {
    const { id, type, key } = req.params;
    const currentUserId = lodash.get(req, "identity.id") as string;
    if (!currentUserId) {
      return res
        .status(403)
        .json({ message: "Could not resolve your identity!" });
    }
    const photoKey = currentUserId + "/" + key + ".jpg";
    switch (type) {
      case "year":
        break;
      case "album":
        break;
      case "single":
        log(`Getting ${photoKey} from S3`, ["yellowBright"], ["italic"]);
        const signedPhoto = await getSPhotoFromS3(photoKey);
        const photoArrayBuffer = await (await fetch(signedPhoto)).arrayBuffer();
        const photoBuffer = Buffer.from(photoArrayBuffer);
        log(`Retrieved ${photoKey} from S3`, ["greenBright"], ["italic"]);
        return res.status(200).json({
          key,
          signedPhoto,
          buffer: photoBuffer, // Moving to cloudfront
        });
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const getPhotosById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id, type } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({
          message: "Failed to get id from client!",
        })
        .end();
    }
    if (type === "albumId") {
      const photos = await getPhotosByAlbumId(id);
      return res.status(200).json(photos);
    }
    if (type === "userId") {
      const photos = await getPhotosByUserId(id);
      return res.status(200).json(photos);
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
