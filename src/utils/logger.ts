import chalk, { Chalk } from "chalk";

type LogStyle =
  | "reset"
  | "bold"
  | "dim"
  | "italic"
  | "underline"
  | "overline"
  | "inverse"
  | "hidden"
  | "strikethrough"
  | "visible";

type LogColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "blackBright"
  | "redBright"
  | "greenBright"
  | "yellowBright"
  | "yellowBright"
  | "blueBright"
  | "magentaBright"
  | "cyanBright"
  | "whiteBright"
  | "bgBlack"
  | "bgRed"
  | "bgGreen"
  | "bgYellow"
  | "bgBlue"
  | "bgMagenta"
  | "bgCyan"
  | "bgWhite"
  | "bgBlackBright"
  | "bgRedBright"
  | "bgGreenBright"
  | "bgYellowBright"
  | "bgYellowBright"
  | "bgBlueBright"
  | "bgMagentaBright"
  | "bgCyanBright"
  | "bgWhiteBright";

export const log = (
  message: string,
  color?: LogColor[],
  style?: LogStyle[]
) => {
  let logger = new Chalk();
  color?.forEach((c) => (logger = logger[c]));
  style?.forEach((s) => (logger = logger[s]));
  console.log(logger(` ${message} `));
};
