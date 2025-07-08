/*
  Warnings:

  - You are about to drop the `AuthLogSchema` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `counterSchema` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rateLimitSchema` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminAction" DROP CONSTRAINT "AdminAction_id_fkey";

-- DropTable
DROP TABLE "AuthLogSchema";

-- DropTable
DROP TABLE "counterSchema";

-- DropTable
DROP TABLE "rateLimitSchema";

-- CreateTable
CREATE TABLE "AuthLog" (
    "id" SERIAL NOT NULL,
    "userID" TEXT NOT NULL,
    "eventType" "AuthLogEvent" NOT NULL,
    "deviceID" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceType" "DeviceType",
    "performedBy" "PerformedBy" NOT NULL DEFAULT 'CUSTOMER',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "deviceID" TEXT NOT NULL,
    "routeKey" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "lastRequestAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("deviceID","routeKey")
);

-- CreateIndex
CREATE INDEX "AuthLog_userID_idx" ON "AuthLog"("userID");

-- AddForeignKey
ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_id_fkey" FOREIGN KEY ("id") REFERENCES "AuthLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
