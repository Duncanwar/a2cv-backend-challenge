-- CreateEnum
CREATE TYPE "ERole" AS ENUM ('Admin', 'User');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "ERole" NOT NULL DEFAULT 'User';
