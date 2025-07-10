module.exports = Object.freeze({
  // 🔐 User Verification & Blocking
  UNBLOCK_VIA: ["USER_ID", "EMAIL", "PHONE"],
  BLOCK_VIA: ["USER_ID", "EMAIL", "PHONE"],

  // 🧑‍💻 User Types
  USER_TYPE: ["CUSTOMER", "ADMIN"],

  // 🚫 Immutable Fields (for profile updates)
  IMMUTABLE_FIELDS: [
    "_id", "__v",                     // Mongo internal
    "userID", "userType",             // Identity + Role
    "isVerified", "isBlocked",        // Security status
    "jwtTokenIssuedAt",               // Token control
    "createdAt", "updatedAt",         // System timestamps
    "isActive", "lastLogin",          // Lifecycle flags
    "verificationToken",              // Token used for verifying email/phone
    "blockReason", "unblockReason",
    "blockedAt", "unblockedAt",
    "lastActivatedAt", "lastDeactivatedAt",
    "blockedBy", "unblockedBy",
    "lastLogout", "loginCount",
    "blockVia", "unblockVia",
    "blockCount", "unblockCount",
    "devices", "otp", "refreshToken", "password",
    "passwordChangedAt", "timestamps", "versionKey"
  ],

  // 🎯 Admin Action Reasons
  ADMIN_ACTION_REASONS: {
    CHECK_USER_ACTIVITY: "TO_CHECK_USER_ACTIVITY",
    VERIFY_ACCOUNT_STATUS: "TO_VERIFY_ACCOUNT_STATUS",
    AUDIT_LOG_PURPOSE: "TO_AUDIT_USER_LOGS",
    RESET_PASSWORD_REQUESTED: "PASSWORD_RESET_VERIFICATION",
    USER_RAISED_ISSUE: "USER_RAISED_ISSUE",
    ACCOUNT_VERIFICATION: "VERIFY_USER_MANUALLY"
  },

  // ⛔ Block Reasons
  BLOCK_REASONS: {
    POLICY_VIOLATION: "POLICY_VIOLATION",
    SPAM_ACTIVITY: "SPAM_ACTIVITY",
    HARASSMENT: "HARASSMENT",
    FRAUDULENT_BEHAVIOR: "FRAUDULENT_BEHAVIOR",
    SUSPICIOUS_LOGIN: "SUSPICIOUS_LOGIN",
    OTHER: "OTHER"
  },

  // ✅ Unblock Reasons
  UNBLOCK_REASONS: {
    MANUAL_REVIEW_PASSED: "MANUAL_REVIEW_PASSED",
    USER_APPEAL_GRANTED: "USER_APPEAL_GRANTED",
    SYSTEM_ERROR: "SYSTEM_ERROR",
    OTHER: "OTHER"
  }
});
