-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ViaType" AS ENUM ('USER_ID', 'PHONE', 'EMAIL');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'LAPTOP', 'TABLET');

-- CreateEnum
CREATE TYPE "BlockReason" AS ENUM ('POLICY_VIOLATION', 'SPAM_ACTIVITY', 'HARASSMENT', 'FRAUDULENT_BEHAVIOR', 'SUSPICIOUS_LOGIN', 'OTHER');

-- CreateEnum
CREATE TYPE "UnblockReason" AS ENUM ('MANUAL_REVIEW_PASSED', 'USER_APPEAL_GRANTED', 'SYSTEM_ERROR', 'OTHER');

-- CreateTable
CREATE TABLE "UserSchema" (
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

-- CreateTable
CREATE TABLE "PhoneNumber" (
    "userID" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Device" (
    "deviceID" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceType" "DeviceType",
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "userID" TEXT NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("deviceID")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "userID" TEXT NOT NULL,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSchema_fullPhoneNumber_key" ON "UserSchema"("fullPhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "UserSchema_userID_key" ON "UserSchema"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "UserSchema_emailID_key" ON "UserSchema"("emailID");

-- CreateIndex
CREATE UNIQUE INDEX "Device_userID_key" ON "Device"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_userID_key" ON "OTP"("userID");

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_userID_fkey" FOREIGN KEY ("userID") REFERENCES "UserSchema"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userID_fkey" FOREIGN KEY ("userID") REFERENCES "UserSchema"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userID_fkey" FOREIGN KEY ("userID") REFERENCES "UserSchema"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
