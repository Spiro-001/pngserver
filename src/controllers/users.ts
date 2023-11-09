import express from "express";
import {
  deleteUserById,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUserById,
} from "../../prisma/users.js";
import { authentication, rand } from "../utils/auth.js";

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUsers();
    return res.status(200).json(users).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    const deletedUser = await deleteUserById(id);
    return res.status(200).json(deletedUser).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const { email, name, password } = req.body;

    if (password) {
      const user = await getUserById(id, true);
      const salt = rand();
      const newAuthentication = {
        salt,
        password: authentication(salt, password),
        sessionToken: authentication(rand(), user.id.toString()),
      };
      user.authentication = newAuthentication;
      const updatedUser = await updateUserById(id, user);
      res.cookie("CONNECTED2U_AUTH_TOKEN", user.authentication.sessionToken, {
        domain: "localhost",
      });
      return res.status(200).json(updatedUser).end();
    }

    const updatedUser = await updateUserById(id, {
      name,
    });

    return res.status(200).json(updatedUser).end();
  } catch (error) {
    console.log(error);
    return res.status(400);
  }
};
