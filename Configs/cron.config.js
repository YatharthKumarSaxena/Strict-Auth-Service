// 📅 configs/cron.config.js

module.exports = {
  userCleanup: {
    enable: true,
    cronSchedule: process.env.USER_CLEANUP_CRON || "0 3 * * 0",               // ⏰ Default: Sunday 3 AM
    timezone: process.env.USER_CLEANUP_TIMEZONE || "Asia/Kolkata",
    deactivatedRetentionDays: Number(process.env.USER_RETENTION_DAYS) || 60
  },
  authLogCleanup: {
    enable: true,
    cronSchedule: process.env.AUTH_LOG_CLEANUP_CRON || "0 5 * * 0",           // ⏰ Default: Sunday 5 AM
    timezone: process.env.AUTH_LOG_CLEANUP_TIMEZONE || "Asia/Kolkata",
    deactivatedRetentionDays: Number(process.env.AUTH_LOG_RETENTION_DAYS) || 90
  },
  deviceRateLimitersCleanup: {
    enable: true,
    cronSchedule: process.env.DEVICE_LIMITER_CLEANUP_CRON || "0 2 * * 0",     // ⏰ Default: Sunday 2 AM
    timezone: process.env.DEVICE_LIMITER_TIMEZONE || "Asia/Kolkata",
    deactivatedRetentionDays: Number(process.env.DEVICE_LIMITER_RETENTION_DAYS) || 7
  }
};
