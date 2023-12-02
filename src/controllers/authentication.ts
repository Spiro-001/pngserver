import express from "express";
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserById,
} from "../../prisma/users.js";
import { authentication, rand } from "../utils/auth.js";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        email: !email ? "Email is empty!" : "[SECRET]",
        password: !password ? "Password is empty!" : "[SECRET]",
      });
    }

    const user = await getUserByEmail(email, true);
    if (!user) {
      return res
        .status(400)
        .json({ message: "User with that email does not exist" })
        .end();
    }

    const hash = authentication(user.authentication.salt, password);
    if (user.authentication.password !== hash) {
      return res.status(403).json({ message: "Invalid credentials!" }).end();
    }

    const salt = rand();
    user.authentication.sessionToken = authentication(salt, user.id.toString());
    await updateUserById(user.id, user);
    res.cookie("CONNECTED2U_AUTH_TOKEN", user.authentication.sessionToken, {
      domain: process.env.SERVER_HOST,
      path: "/",
    });
    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({
          email: !email ? "Email is empty!" : "[SECRET]",
          password: !password ? "Password is empty!" : "[SECRET]",
          name: !name ? "Name is empty!" : "[SECRET]",
        })
        .end();
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" }).end();
    }

    const salt = rand();
    const newUser = await createUser({
      email,
      name,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res.status(200).json(newUser).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const validate = async (req: express.Request, res: express.Response) => {
  try {
    const { id, sessionToken } = req.body;
    if (!sessionToken) {
      return res
        .status(200)
        .json({
          validate: false,
        })
        .end();
    }

    if (!id) {
      return res
        .status(401)
        .json({
          id: !id ? "Invalid identifcation number!" : "",
        })
        .end();
    }
    const existingUser = await getUserById(id, true);
    if (!existingUser) {
      return res
        .status(401)
        .json({
          id: "Unable to find user with that id!",
        })
        .end();
    }
    if (sessionToken !== existingUser.authentication.sessionToken) {
      res.cookie("CONNECTED2U_AUTH_TOKEN", "", {
        domain: process.env.SERVER_HOST,
        path: "/",
      });
      return res
        .status(200)
        .json({
          validate: false,
        })
        .end();
    }

    return res
      .status(200)
      .json({
        validate: existingUser,
      })
      .end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
