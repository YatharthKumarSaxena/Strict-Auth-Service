-- CreateEnum
CREATE TYPE "AuthLogEvent" AS ENUM ('LOGIN', 'LOGOUT_ALL_DEVICE', 'ACTIVATE', 'DEACTIVATE', 'BLOCKED', 'UNBLOCKED', 'CHANGE_PASSWORD', 'REGISTER', 'LOGOUT_SPECIFIC_DEVICE', 'CHECK_AUTH_LOGS', 'GET_USER_ACTIVE_DEVICES', 'GET_MY_ACTIVE_DEVICES', 'ACCESS_TOKEN', 'REFRESH_TOKEN', 'UPDATE_ACCOUNT_DETAILS', 'PROVIDE_USER_ACCOUNT_DETAILS', 'PROVIDE_MY_ACCOUNT_DETAILS', 'GET_TOTAL_REGISTERED_USERS', 'SET_REFRESH_TOKEN_FOR_ADMIN', 'CLEAN_UP_DEACTIVATED_USER', 'CLEAN_UP_AUTH_LOGS');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('LAPTOP', 'MOBILE', 'TABLET');

-- CreateEnum
CREATE TYPE "PerformedBy" AS ENUM ('CUSTOMER', 'ADMIN', 'SYSTEM');

-- CreateTable
CREATE TABLE "DeviceRateLimit" (
    "id" SERIAL NOT NULL,
    "deviceID" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthLogSchema" (
    "id" SERIAL NOT NULL,
    "userID" TEXT NOT NULL,
    "eventType" "AuthLogEvent" NOT NULL,
    "deviceID" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceType" "DeviceType",
    "performedBy" "PerformedBy" NOT NULL DEFAULT 'CUSTOMER',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthLogSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAction" (
    "id" INTEGER NOT NULL,
    "targetUserID" TEXT,
    "reason" TEXT,
    "filter" "AuthLogEvent"[],

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceRateLimit_deviceID_key" ON "DeviceRateLimit"("deviceID");

-- CreateIndex
CREATE INDEX "AuthLogSchema_userID_idx" ON "AuthLogSchema"("userID");

-- AddForeignKey
ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_id_fkey" FOREIGN KEY ("id") REFERENCES "AuthLogSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
