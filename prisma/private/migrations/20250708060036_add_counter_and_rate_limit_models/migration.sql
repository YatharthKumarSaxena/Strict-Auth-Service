/*
  Warnings:

  - The primary key for the `DeviceRateLimit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `DeviceRateLimit` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "DeviceRateLimit_deviceID_key";

-- AlterTable
ALTER TABLE "DeviceRateLimit" DROP CONSTRAINT "DeviceRateLimit_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "DeviceRateLimit_pkey" PRIMARY KEY ("deviceID");

-- CreateTable
CREATE TABLE "counterSchema" (
    "id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "counterSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rateLimitSchema" (
    "deviceID" TEXT NOT NULL,
    "routeKey" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "lastRequestAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rateLimitSchema_pkey" PRIMARY KEY ("deviceID","routeKey")
);
