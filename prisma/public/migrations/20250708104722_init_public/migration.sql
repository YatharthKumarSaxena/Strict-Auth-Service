/*
  Warnings:

  - You are about to drop the `UserSchema` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_userID_fkey";

-- DropForeignKey
ALTER TABLE "OTP" DROP CONSTRAINT "OTP_userID_fkey";

-- DropForeignKey
ALTER TABLE "PhoneNumber" DROP CONSTRAINT "PhoneNumber_userID_fkey";

-- DropTable
DROP TABLE "UserSchema";

-- CreateTable
CREATE TABLE "User" (
    "name" TEXT,
    "fullPhoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "emailID" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "userType" "UserType" NOT NULL DEFAULT 'CUSTOMER',
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "blockedVia" "ViaType",
    "unblockedVia" "ViaType",
    "blockReason" "BlockReason",
    "blockCount" INTEGER NOT NULL DEFAULT 0,
    "unblockCount" INTEGER NOT NULL DEFAULT 0,
    "unblockReason" "UnblockReason",
    "blockedBy" TEXT,
    "unblockedBy" TEXT,
    "blockedAt" TIMESTAMP(3),
    "unblockedAt" TIMESTAMP(3),
    "lastActivatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDeactivatedAt" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "lastLogout" TIMESTAMP(3),
    "jwtTokenIssuedAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_fullPhoneNumber_key" ON "User"("fullPhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_userID_key" ON "User"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailID_key" ON "User"("emailID");

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
