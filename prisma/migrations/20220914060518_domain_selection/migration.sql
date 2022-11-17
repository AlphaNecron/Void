/*
  Warnings:

  - You are about to drop the column `domain` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User"
    DROP COLUMN "domain",
    ADD COLUMN "domains" TEXT[];
