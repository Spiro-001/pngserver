import { prisma } from "./prisma.js";

type UserType = {
  name: string;
  email: string;
  authentication: {
    salt: string;
    password: string;
    sessionToken: string;
  };
};

type NewUserType = {
  name: string;
  email: string;
  authentication: {
    salt: string;
    password: string;
  };
};

type UpdateUserType = {
  name?: string;
  email?: string;
  authentication?: {
    salt?: string;
    password?: string;
  };
};

export const getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
};

export const getUserByEmail = async (
  email: string,
  selectAuth: boolean = false
) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      authentication: selectAuth,
    },
  });
};

export const getUserById = async (id: string, selectAuth: boolean = false) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      authentication: selectAuth,
    },
  });
};

export const getUserBySessionToken = async (sessionToken: string) => {
  return await prisma.user.findFirst({
    where: {
      authentication: {
        path: ["sessionToken"],
        equals: sessionToken,
      },
    },
  });
};

export const createUser = async (
  user: NewUserType,
  selectAuth: boolean = false
) => {
  return await prisma.user.create({
    data: user,
    select: {
      id: true,
      email: true,
      name: true,
      authentication: selectAuth,
    },
  });
};

export const deleteUserById = async (
  id: string,
  selectAuth: boolean = false
) => {
  return await prisma.user.delete({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      authentication: selectAuth,
    },
  });
};

export const updateUserById = async (
  id: string,
  user: UpdateUserType,
  selectAuth: boolean = false
) => {
  return await prisma.user.update({
    where: {
      id,
    },
    data: user,
    select: {
      id: true,
      email: true,
      name: true,
      authentication: selectAuth,
    },
  });
};
