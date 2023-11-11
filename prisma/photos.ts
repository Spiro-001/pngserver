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
  take: number = 10,
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
  take: number = 10,
  skip: number = 0
) => {
  return await prisma.photo.findMany({
    where: {
      albumId,
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
