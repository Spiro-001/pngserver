import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

let gprisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  gprisma = new PrismaClient();
} else {
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  gprisma = globalWithPrisma.prisma;
}

export const prisma = gprisma;
