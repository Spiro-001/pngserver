import Jpeg from "jpeg-js";
import { decode } from "fast-png";

type DecodedType = {
  width: number;
  height: number;
  channels: number;
  data: Uint16Array;
  depth: number;
  text: Record<string, string>;
  resolution: {
    x: number;
    y: number;
    unit: number;
  };
};

export const pngToJpeg = (opts: any) => {
  opts = Object.assign({ quality: 50 }, opts);

  return (buf: Buffer) => {
    const data = decode(buf) as DecodedType;
    return Jpeg.encode(
      { data: data.data, width: data.width, height: data.height },
      opts.quality
    ).data;
  };
};
