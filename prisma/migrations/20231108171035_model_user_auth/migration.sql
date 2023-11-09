/*
  Warnings:

  - You are about to drop the column `password_digest` on the `User` table. All the data in the column will be lost.
  - Added the required column `authentication` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password_digest",
ADD COLUMN     "authentication" JSONB NOT NULL;
