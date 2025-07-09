const cron = require("node-cron");
const prismaPrivate = require("../clients/private.prisma");
const { logWithTime } = require("../utils/time-stamps.utils");
const { authLogCleanup } = require("../configs/cron.config");
const { errorMessage} = require("../configs/error-handler.configs");
const authLogEvents = require("../configs/auth-log-events.config");

const cleanAuthLogs = async () => {
  try {
    if(!authLogCleanup.enable)return;
    if (!authLogCleanup.deactivatedRetentionDays || authLogCleanup.deactivatedRetentionDays < 1) {
      logWithTime("⚠️ Invalid retention days configuration. Skipping auth log cleanup.");
      return;
    }
    const cutoffDate = new Date(Date.now() - authLogCleanup.deactivatedRetentionDays * 24 * 60 * 60 * 1000);
    logWithTime("📅 [CRON-JOB] ➤ Auth Logs Cleanup Started...");
    const result = await prismaPrivate.authLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } }
    });
    await logAuthEvent({
      user: { userID: "SYSTEM_BATCH_CRON", userType: "SYSTEM" },
      deviceID: process.env.DEVICE_UUID,
      deviceName: process.env.DEVICE_NAME,
      deviceType: process.env.DEVICE_TYPE
    }, authLogEvents.CLEAN_UP_AUTH_LOGS , {
    reason: `Deleted ${result.count} auth logs (> ${authLogCleanup.deactivatedRetentionDays} days)`
    });
    if(result.count === 0){
      logWithTime(`📭 No auth logs eligible for deletion (older than ${authLogCleanup.deactivatedRetentionDays} days).`);
    }else {
      logWithTime(`🗑️ Auth Logs Deletion Job: ${result.count} auth logs hard deleted (created > ${authLogCleanup.deactivatedRetentionDays} days).`);
    }
  } catch (err) {
    logWithTime("❌ Internal Error in deleting old auth logs by Cron Job.");
    errorMessage(err);
    return;
  }
};

// ⏰ Run on schedule
cron.schedule(authLogCleanup.cronSchedule, cleanAuthLogs, {
  timezone: authLogCleanup.timezone
});
