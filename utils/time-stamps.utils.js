// 📦 utils/time-stamps.utils.js

// 🔁 Set to track already printed logs in the current session
const recentLogs = new Set();

// 🕓 Generates ISO Format Timestamp
exports.getTimeStamp = () => {
  return `[${new Date().toISOString()}]`;
};

// 🧠 Hashing function to normalize log content for duplication check
function hashLog(args) {
  return JSON.stringify(args);
}

// 🕒 Enhanced Logger with Duplicate Log Suppression
exports.logWithTime = (...args) => {
  const logHash = hashLog(args);

  // Only log if not seen before
  if (!recentLogs.has(logHash)) {
    recentLogs.add(logHash);
    console.log(`🕒 ${exports.getTimeStamp()}`, ...args);
  }
};
