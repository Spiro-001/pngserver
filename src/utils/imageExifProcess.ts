import piexif, { IExif, IExifElement, TagValues } from "piexif-ts";
import { log } from "./logger.js";
import ExifReader from "exifreader";
import convert from "heic-convert";
import { pngToJpeg } from "./pngToJpeg.js";

export const processEXIF = async (
  image: Express.Multer.File,
  photoData: {
    title: string;
    description: string;
    date: string;
    rotate: number;
  }
) => {
  const { title, description, date, rotate } = photoData;
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

  if (image.mimetype === "image/png") {
    log(
      "Detected PNG file type! Converting to JPEG, this may take a couple minutes...",
      ["yellow"],
      ["bold"]
    );

    const ptjBuffer = pngToJpeg({ quality: 100 })(image.buffer);
    const outputBuffer = Buffer.from(ptjBuffer);

    image.buffer = outputBuffer;
    image.mimetype = "image/jpeg";

    log("Successfully converted to JPEG!", ["green"], ["bold"]);
  }

  const binaryData = Buffer.from(image.buffer).toString("binary");
  const load = piexif.load(binaryData);

  // 0th DATA
  const zeroth: Record<string, any> = {};
  if (exifLoader["Make"]?.description)
    zeroth["271"] = exifLoader["Make"].description; // Make
  if (exifLoader["Model"]?.description)
    zeroth["272"] = exifLoader["Model"].description; // Model
  if (exifLoader["Orientation"]?.value)
    zeroth["274"] = exifLoader["Orientation"].value; // Orientation
  if (exifLoader["XResolution"]?.value)
    zeroth["282"] = exifLoader["XResolution"].value; // XResolution
  if (exifLoader["YResolution"]?.value)
    zeroth["283"] = exifLoader["YResolution"].value; // YResolution
  if (exifLoader["ResolutionUnit"]?.value)
    zeroth["296"] = exifLoader["ResolutionUnit"].value; // ResolutionUnit
  if (exifLoader["Software"]?.description)
    zeroth["305"] = exifLoader["Software"].description; // Software
  if (exifLoader["DateTime"]?.description)
    zeroth["306"] = exifLoader["DateTime"].description; // DateTime
  if (exifLoader["HostComputer"]?.description)
    zeroth["316"] = exifLoader["HostComputer"].description; // HostComputer
  if (exifLoader["ExposureTime"]?.value)
    zeroth["33434"] = exifLoader["ExposureTime"].value; // ExposureTime
  if (exifLoader["SensingMethod"]?.value)
    zeroth["37399"] = exifLoader["SensingMethod"].value; // SensingMethod

  // EXIF DATA
  const exif: Record<string, any> = {};
  if (exifLoader["FNumber"]?.value) exif["33437"] = exifLoader["FNumber"].value; // FNumber
  if (exifLoader["ExposureProgram"]?.value)
    exif["34850"] = exifLoader["ExposureProgram"].value; // ExposureProgram
  if (exifLoader["ISOSpeedRatings"]?.value)
    exif["34855"] = exifLoader["ISOSpeedRatings"].value; // ISOSpeedRatings
  if (exifLoader["ExifVersion"]?.description)
    exif["36864"] = exifLoader["ExifVersion"].description; // ExifVersion
  if (exifLoader["DateTimeOriginal"]?.description)
    exif["36867"] = exifLoader["DateTimeOriginal"].description; // DateTimeOriginal
  if (exifLoader["ExposureProgram"]?.description)
    exif["36868"] = exifLoader["DateTimeDigitized"].description; // DateTimeDigitized
  if (exifLoader["ShutterSpeedValue"]?.value)
    exif["37377"] = exifLoader["ShutterSpeedValue"].value; // ShutterSpeedValue
  if (exifLoader["ApertureValue"]?.value)
    exif["37378"] = exifLoader["ApertureValue"].value; // ApertureValue
  if (exifLoader["BrightnessValue"]?.value)
    exif["37379"] = exifLoader["BrightnessValue"].value; // BrightnessValue
  if (exifLoader["ExposureBiasValue"]?.value)
    exif["37380"] = exifLoader["ExposureBiasValue"].value; // ExposureBiasValue
  if (exifLoader["MeteringMode"]?.value)
    exif["37383"] = exifLoader["MeteringMode"].value; // MeteringMode
  if (exifLoader["Flash"]?.value) exif["37385"] = exifLoader["Flash"].value; // Flash
  if (exifLoader["FocalLength"]?.value)
    exif["37386"] = exifLoader["FocalLength"].value; // FocalLength
  if (exifLoader["SubjectArea"]?.value)
    exif["37396"] = exifLoader["SubjectArea"].value; // SubjectArea
  if (exifLoader["MakerNote"]?.description)
    exif["37500"] = exifLoader["MakerNote"].description; // MakerNote
  if (exifLoader["SubSecTimeOriginal"]?.description)
    exif["37521"] = exifLoader["SubSecTimeOriginal"].description; // SubSecTimeOriginal
  if (exifLoader["SubSecTimeDigitized"]?.description)
    exif["37522"] = exifLoader["SubSecTimeDigitized"].description; // SubSecTimeDigitized
  if (exifLoader["ColorSpace"]?.value)
    exif["40961"] = exifLoader["ColorSpace"].value; // ColorSpace
  if (exifLoader["PixelXDimension"]?.value)
    exif["40962"] = exifLoader["PixelXDimension"].value; // PixelXDimension
  if (exifLoader["PixelYDimension"]?.value)
    exif["40963"] = exifLoader["PixelYDimension"].value; // PixelYDimension
  if (exifLoader["SensingMethod"]?.value)
    exif["41495"] = exifLoader["SensingMethod"].value; // SensingMethod
  if (exifLoader["SceneType"]?.description)
    exif["41729"] = exifLoader["SceneType"].description; // SceneType
  if (exifLoader["ExposureMode"]?.value)
    exif["41986"] = exifLoader["ExposureMode"].value; // ExposureMode
  if (exifLoader["WhiteBalance"]?.value)
    exif["41987"] = exifLoader["WhiteBalance"].value; // WhiteBalance
  if (exifLoader["FocalLengthIn35mmFilm"]?.value)
    exif["41989"] = exifLoader["FocalLengthIn35mmFilm"].value; // FocalLengthIn35mmFilm
  if (exifLoader["LensSpecification"]?.value)
    exif["42034"] = exifLoader["LensSpecification"].value; // LensSpecification
  if (exifLoader["LensMake"]?.description)
    exif["42035"] = exifLoader["LensMake"].description; // LensMake
  if (exifLoader["LensModel"]?.description)
    exif["42036"] = exifLoader["LensModel"].description; // LensModel

  // GPS DATA
  const gps: Record<string, any> = {};
  if (exifLoader["GPSLatitudeRef"]?.description[0]) {
    gps["1"] = exifLoader["GPSLatitudeRef"].description[0]; // GPSLatitudeRef
  }
  if (exifLoader["GPSLatitude"]?.value) {
    gps["2"] = exifLoader["GPSLatitude"].value; // GPSLatitude
  }
  if (exifLoader["GPSLongitudeRef"]?.description[0]) {
    gps["3"] = exifLoader["GPSLongitudeRef"].description[0]; // GPSLongitudeRef
  }
  if (exifLoader["GPSLongitude"]?.value) {
    gps["4"] = exifLoader["GPSLongitude"].value; // GPSLongitude
  }
  if (exifLoader["GPSAltitudeRef"]?.value) {
    gps["5"] = exifLoader["GPSAltitudeRef"].value; // GPSAltitudeRef
  }
  if (exifLoader["GPSAltitude"]?.value) {
    gps["6"] = exifLoader["GPSAltitude"].value; // GPSAltitude
  }
  if (exifLoader["GPSTimeStamp"]?.value) {
    gps["7"] = exifLoader["GPSTimeStamp"].value; // GPSTimeStamp
  }
  if (exifLoader["GPSSpeedRef"]?.value) {
    gps["12"] = exifLoader["GPSSpeedRef"].description; // GPSSpeedRef
  }
  if (exifLoader["GPSSpeed"]?.value) {
    gps["13"] = exifLoader["GPSSpeed"].value; // GPSSpeed
  }
  if (exifLoader["GPSImgDirectionRef"]?.value) {
    gps["16"] = exifLoader["GPSImgDirectionRef"].description; // GPSImgDirectionRef
  }
  if (exifLoader["GPSImgDirection"]?.value) {
    gps["17"] = exifLoader["GPSImgDirection"].value; // GPSImgDirection
  }
  if (exifLoader["GPSDestBearingRef"]?.value) {
    gps["23"] = exifLoader["GPSDestBearingRef"].description; // GPSDestBearingRef
  }
  if (exifLoader["GPSDestBearing"]?.value) {
    gps["24"] = exifLoader["GPSDestBearing"].value; // GPSDestBearing
  }
  if (exifLoader["GPSDateStamp"]?.value) {
    gps["29"] = exifLoader["GPSDateStamp"].description; // GPSDateStamp
  }
  if (exifLoader["GPSHPositioningError"]?.value) {
    gps["31"] = exifLoader["GPSHPositioningError"].value; // GPSHPositioningError
  }

  // INTEROP DATA
  const interop: Record<string, any> = {};
  load["0th"] = zeroth;
  load["Exif"] = exif;
  load["GPS"] = gps;
  load["Interop"] = interop;
  load["thumbnail"] = load.thumbnail ?? exifLoader.Thumbnail?.base64 ?? "";

  console.log(load);

  // Modify orginal date
  if (date) load["Exif"][TagValues.ExifIFD.DateTimeOriginal] = date;
  if (rotate) load["0th"][TagValues.ImageIFD.Orientation] = rotate; // 1: rotate(0deg), 3: rotate(180deg), 6: rotate(90deg), 8: rotate(270deg)

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
  return newJpeg;
};
