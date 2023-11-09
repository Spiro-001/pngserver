import express from "express";
import ExifReader from "exifreader";
import piexif, { IExif, IExifElement, TagValues } from "piexif-ts";
import convert from "heic-convert";
import decode from "heic-decode";
import { getSPhotoFromS3, uploadSPhotoToS3 } from "../aws/s3.js";
import { log } from "../utils/logger.js";

export const uploadPhoto = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { title, description, date } = req.body;
    const image = req.file;
    const exifLoader = ExifReader.load(image.buffer);

    if (image.mimetype === "image/heic") {
      log(
        "Detected HEIC file type! Converting to JPEG, this may take a couple minutes...",
        ["yellow"],
        ["bold"]
      );

      const HEICtoJPEGBuffer = await convert({
        buffer: image.buffer,
        format: "JPEG",
      });

      const outputBuffer = Buffer.from(HEICtoJPEGBuffer);

      image.buffer = outputBuffer;
      image.mimetype = "image/jpeg";

      log("Successfully converted to JPEG!", ["green"], ["bold"]);
    }

    const binaryData = Buffer.from(image.buffer).toString("binary");
    const load = piexif.load(binaryData);

    // 0th DATA
    const zeroth: Record<string, any> = {};
    zeroth["271"] = exifLoader["Make"].description; // Make
    zeroth["272"] = exifLoader["Model"].description; // Model
    zeroth["274"] = exifLoader["Orientation"].value; // Orientation
    zeroth["282"] = exifLoader["XResolution"].value; // XResolution
    zeroth["283"] = exifLoader["YResolution"].value; // YResolution
    zeroth["296"] = exifLoader["ResolutionUnit"].value; // ResolutionUnit
    zeroth["305"] = exifLoader["Software"].description; // Software
    zeroth["306"] = exifLoader["DateTime"].description; // DateTime
    zeroth["316"] = exifLoader["HostComputer"].description; // HostComputer
    zeroth["33434"] = exifLoader["ExposureTime"].value; // ExposureTime
    zeroth["37399"] = exifLoader["SensingMethod"].value; // SensingMethod

    // EXIF DATA
    const exif: Record<string, any> = {};
    exif["33437"] = exifLoader["FNumber"].value; // FStop
    exif["34850"] = exifLoader["ExposureProgram"].value; // ExposureProgram
    exif["34855"] = exifLoader["ISOSpeedRatings"].value; // ISOSpeedRatings
    exif["36864"] = exifLoader["ExifVersion"].description; // ExifVersion
    exif["36867"] = exifLoader["DateTimeOriginal"].description; // DateTimeOriginal
    exif["36868"] = exifLoader["DateTimeDigitized"].description; // DateTimeDigitized
    exif["37377"] = exifLoader["ShutterSpeedValue"].value; // ShutterSpeedValue
    exif["37378"] = exifLoader["ApertureValue"].value; // ApertureValue
    exif["37379"] = exifLoader["BrightnessValue"].value; // BrightnessValue
    exif["37380"] = exifLoader["ExposureBiasValue"].value; // ExposureBiasValue
    exif["37383"] = exifLoader["MeteringMode"].value; // MeteringMode
    exif["37385"] = exifLoader["Flash"].value; // Flash
    exif["37386"] = exifLoader["FocalLength"].value; // FocalLength
    exif["37396"] = exifLoader["SubjectArea"].value; // SubjectArea
    exif["37500"] = exifLoader["MakerNote"].description; // MakerNote
    exif["37521"] = exifLoader["SubSecTimeOriginal"].description; // SubSecTimeOriginal
    exif["37522"] = exifLoader["SubSecTimeDigitized"].description; // SubSecTimeDigitized
    exif["40961"] = exifLoader["ColorSpace"].value; // ColorSpace
    exif["40962"] = exifLoader["PixelXDimension"].value; // PixelXDimension
    exif["40963"] = exifLoader["PixelYDimension"].value; // PixelYDimension
    exif["41495"] = exifLoader["SensingMethod"].value; // SensingMethod
    exif["41729"] = exifLoader["SceneType"].description; // SceneType
    exif["41986"] = exifLoader["ExposureMode"].value; // ExposureMode
    exif["41987"] = exifLoader["WhiteBalance"].value; // WhiteBalance
    exif["41989"] = exifLoader["FocalLengthIn35mmFilm"].value; // FocalLengthIn35mmFilm
    exif["42034"] = exifLoader["LensSpecification"].value; // LensSpecification
    exif["42035"] = exifLoader["LensMake"].description; // LensMake
    exif["42036"] = exifLoader["LensModel"].description; // LensModel

    // GPS DATA
    const gps: Record<string, any> = {};
    gps["1"] = exifLoader["GPSLatitudeRef"].description[0]; // GPSLatitudeRef
    gps["2"] = exifLoader["GPSLatitude"].value; // GPSLatitude
    gps["3"] = exifLoader["GPSLongitudeRef"].description[0]; // GPSLongitudeRef
    gps["4"] = exifLoader["GPSLongitude"].value; // GPSLongitude
    gps["5"] = exifLoader["GPSAltitudeRef"].value; // GPSAltitudeRef
    gps["6"] = exifLoader["GPSAltitude"].value; // GPSAltitude
    gps["7"] = exifLoader["GPSTimeStamp"].value; // GPSTimeStamp
    gps["12"] = exifLoader["GPSSpeedRef"].description; // GPSSpeedRef
    gps["13"] = exifLoader["GPSSpeed"].value; // GPSSpeed
    gps["16"] = exifLoader["GPSImgDirectionRef"].description; // GPSImgDirectionRef
    gps["17"] = exifLoader["GPSImgDirection"].value; // GPSImgDirection
    gps["23"] = exifLoader["GPSDestBearingRef"].description; // GPSDestBearingRef
    gps["24"] = exifLoader["GPSDestBearing"].value; // GPSDestBearing
    gps["29"] = exifLoader["GPSDateStamp"].description; // GPSDateStamp
    gps["31"] = exifLoader["GPSHPositioningError"].value; // GPSHPositioningError

    // INTEROP DATA
    const interop: Record<string, any> = {};
    const interopIFD: Record<string, number> = { ...TagValues.InteropIFD };

    load["0th"] = zeroth;
    load["Exif"] = exif;
    load["GPS"] = gps;
    load["Interop"] = interop;
    load["thumbnail"] = exifLoader.Thumbnail?.base64 ?? "";

    // Modify orginal date
    load["Exif"][TagValues.ExifIFD.DateTimeOriginal] = date;

    const exifStr = piexif.dump(load);
    const inserted = piexif.insert(exifStr, binaryData);
    const newJpegBuffer = Buffer.from(inserted, "binary");
    const newJpeg = {
      fieldname: image.fieldname,
      originalname: image.originalname,
      encoding: image.encoding,
      mimetype: image.mimetype,
      buffer: newJpegBuffer,
      size: image.size,
    } as Express.Multer.File;
    const photo = await uploadSPhotoToS3(newJpeg, title ?? image.filename);
    const signedPhoto = await getSPhotoFromS3(title ?? image.filename);

    return res.status(200).json({
      message: "File uploaded successfully!",
      signedUrl: signedPhoto,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
