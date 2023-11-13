import { prisma } from "./prisma.js";

export const getPhoto = async (id: string) => {
  return await prisma.photo.findFirst({
    where: {
      id,
    },
  });
};

export const getPhotosByUserId = async (
  uploaderId: string,
  take: number = 50,
  skip: number = 0
) => {
  return await prisma.photo.findMany({
    where: {
      uploaderId,
    },
    take,
    skip,
    select: {
      id: true,
      key: true,
      uploaderId: true,
      Album: true,
    },
  });
};

export const getPhotosByAlbumId = async (
  albumId: string,
  take: number = 50,
  skip: number = 0
) => {
  return await prisma.photo.findMany({
    where: {
      albumId,
    },
    orderBy: {
      originalDate: "asc",
    },
    take,
    skip,
    select: {
      id: true,
      key: true,
      uploaderId: true,
      Album: true,
    },
  });
};

export const createPhoto = async (id: string, key: string, date: string) => {
  try {
    return await prisma.photo.create({
      data: {
        uploaderId: id,
        key,
        originalDate: date,
      },
    });
  } catch (error) {
    return new Error(error);
  }
};
