import express, { response } from "express";
import lodash from "lodash";
import { getUserBySessionToken } from "../../prisma/users.js";

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;
    const currentUserId = lodash.get(req, "identity.id") as string;

    if (!currentUserId) {
      return res
        .status(403)
        .json({ message: "Could not resolve your identity!" });
    }

    if (currentUserId.toString() !== id) {
      return res
        .status(403)
        .json({ message: "You do not have the proper permissions!" });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["CONNECTED2U_AUTH_TOKEN"];
    if (!sessionToken) {
      return res
        .status(403)
        .json({ message: "Valid SessionToken does not exist!" })
        .end();
    }

    const existingUser = await getUserBySessionToken(sessionToken);
    if (!existingUser) {
      return res
        .status(403)
        .json({ message: "You do not have the proper permissions!" })
        .end();
    }

    lodash.merge(req, { identity: existingUser });
    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
