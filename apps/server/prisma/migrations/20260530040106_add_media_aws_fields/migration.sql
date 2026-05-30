-- AlterTable
ALTER TABLE "AdImage" ADD COLUMN     "awsUrl" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "awsUrl" TEXT,
ADD COLUMN     "mediaType" TEXT,
ADD COLUMN     "mediaUrl" TEXT,
ALTER COLUMN "content" SET DEFAULT '';
