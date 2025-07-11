/*
  Warnings:

  - The values [LOGOUT_ALL_DEVICE,BLOCKED,UNBLOCKED,LOGOUT_SPECIFIC_DEVICE,SET_REFRESH_TOKEN_FOR_ADMIN] on the enum `AuthLogEvent` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `reason` on the `DeviceBlock` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DeviceBlockReason" AS ENUM ('SUSPICIOUS_ACTIVITY', 'TOO_MANY_FAILED_ATTEMPTS', 'REPORTED_BY_USER', 'BLOCKED_BY_ADMIN', 'UNKNOWN_DEVICE_LOGIN', 'COMPROMISED_CREDENTIALS');

-- CreateEnum
CREATE TYPE "DeviceUnblockReason" AS ENUM ('FALSE_POSITIVE', 'MANUAL_REVIEW_CLEARED', 'REPORTED_AS_SAFE', 'UNBLOCKED_BY_ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "AuthLogEvent_new" AS ENUM ('LOGIN', 'LOGOUT', 'ACTIVATE', 'DEACTIVATE', 'BLOCKED_USER', 'UNBLOCKED_USER', 'BLOCKED_DEVICE', 'UNBLOCKED_DEVICE', 'CHANGE_PASSWORD', 'REGISTER', 'CHECK_AUTH_LOGS', 'GET_USER_ACTIVE_DEVICES', 'GET_MY_ACTIVE_DEVICES', 'ACCESS_TOKEN', 'REFRESH_TOKEN', 'UPDATE_ACCOUNT_DETAILS', 'PROVIDE_USER_ACCOUNT_DETAILS', 'PROVIDE_MY_ACCOUNT_DETAILS', 'GET_TOTAL_REGISTERED_USERS', 'SET_ACCESS_TOKEN_FOR_ADMIN', 'CLEAN_UP_DEACTIVATED_USER', 'CLEAN_UP_DEVICE_RATE_LIMIT', 'CLEAN_UP_AUTH_LOGS');
ALTER TABLE "AuthLog" ALTER COLUMN "eventType" TYPE "AuthLogEvent_new" USING ("eventType"::text::"AuthLogEvent_new");
ALTER TABLE "AdminAction" ALTER COLUMN "filter" TYPE "AuthLogEvent_new"[] USING ("filter"::text::"AuthLogEvent_new"[]);
ALTER TYPE "AuthLogEvent" RENAME TO "AuthLogEvent_old";
ALTER TYPE "AuthLogEvent_new" RENAME TO "AuthLogEvent";
DROP TYPE "AuthLogEvent_old";
COMMIT;

-- AlterTable
ALTER TABLE "DeviceBlock" DROP COLUMN "reason",
ADD COLUMN     "blockReason" "DeviceBlockReason",
ADD COLUMN     "unblockReason" "DeviceUnblockReason";
