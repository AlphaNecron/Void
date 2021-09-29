-- AlterTable
ALTER TABLE "User" ADD COLUMN     "embedDesc" TEXT,
ADD COLUMN     "embedSiteName" TEXT DEFAULT E'Draconic',
ADD COLUMN     "useEmbed" BOOLEAN DEFAULT false;
