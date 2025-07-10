-- CreateTable
CREATE TABLE "DeviceBlock" (
    "deviceID" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedAt" TIMESTAMP(3),
    "unblockedAt" TIMESTAMP(3),
    "blockedBy" TEXT,
    "unblockedBy" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceBlock_pkey" PRIMARY KEY ("deviceID")
);
