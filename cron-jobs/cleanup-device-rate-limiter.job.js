const authLogEvents = require("../configs/auth-log-events.config");
const prismaPrivate = require("../clients/private.prisma");
const cron = require("node-cron");
const { logWithTime } = require("../utils/time-stamps.utils");
const { errorMessage} = require("../configs/error-handler.configs");
const { deviceRateLimitersCleanup } = require("../configs/cron.config");

const cleanDeviceRateLimiters = async () => {
  try {
    if(!deviceRateLimitersCleanup.enable)return;
    if (!deviceRateLimitersCleanup.deactivatedRetentionDays || deviceRateLimitersCleanup.deactivatedRetentionDays < 1) {
      logWithTime("⚠️ Invalid retention days configuration. Skipping Device Rate Limiters cleanup.");
      return;
    }
    const cutoffDate = new Date(Date.now() - deviceRateLimitersCleanup.deactivatedRetentionDays * 24 * 60 * 60 * 1000);
    logWithTime("📅 [CRON-JOB] ➤ Device Rate Limiters Cleanup Started...");
    const result = await prismaPrivate.deviceRateLimit.deleteMany({
      where: { createdAt: { lt: cutoffDate } }
    });
    await logAuthEvent({
      user: { userID: "SYSTEM_BATCH_CRON", userType: "SYSTEM" },
      deviceID: process.env.DEVICE_UUID,
      deviceName: process.env.DEVICE_NAME,
      deviceType: process.env.DEVICE_TYPE
    }, authLogEvents.CLEAN_UP_DEVICE_RATE_LIMIT , {
    reason: `Deleted ${result.count} Device Rate Limiters (> ${deviceRateLimitersCleanup.deactivatedRetentionDays} days)`
    });
    if(result.count === 0){
      logWithTime(`📭 No Device Rate Limiters eligible for deletion (older than ${deviceRateLimitersCleanup.deactivatedRetentionDays} days).`);
    }else {
      logWithTime(`🗑️ Device Rate Limiters Deletion Job: ${result.count} Device Rate Limiters hard deleted (created > ${deviceRateLimitersCleanup.deactivatedRetentionDays} days).`);
    }
  } catch (err) {
    logWithTime("❌ Internal Error in deleting old Device Rate Limiters by Cron Job.");
    errorMessage(err);
    return;
  }
};

// ⏰ Run on schedule
cron.schedule(deviceRateLimitersCleanup.cronSchedule, cleanDeviceRateLimiters, {
  timezone: deviceRateLimitersCleanup.timezone
});
