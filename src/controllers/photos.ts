import express from "express";
import ExifReader from "exifreader";
import piexif, { IExif, IExifElement, TagValues } from "piexif-ts";

export const uploadPhoto = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { title, description, date } = req.body;
    const image = req.file;

    const exifData = ExifReader.load(image.buffer);
    const binaryData = Buffer.from(image.buffer).toString("binary");
    const load = piexif.load(binaryData);

    // Modify orginal date
    load.Exif[TagValues.ExifIFD.DateTimeOriginal] = date;

    const exifStr = piexif.dump(load);

    const inserted = piexif.insert(exifStr, binaryData);
    const newJpeg = Buffer.from(inserted, "binary");

    const a = ExifReader.load(newJpeg.buffer);

    console.log(exifData.DateTimeOriginal);
    console.log(a.DateTimeOriginal);

    return res.status(200).json({
      message: "hi",
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
