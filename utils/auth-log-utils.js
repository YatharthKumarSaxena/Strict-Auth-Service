const prismaPrivate = require("../clients/private.prisma");
const { logWithTime } = require("../utils/time-stamps.utils");
const { errorMessage } = require("../configs/error-handler.configs");

/**
 * 🔐 Logs an authentication event with full context (user, admin, device info)
 * @param {Object} req - The request object (must contain userID, userType, deviceID)
 * @param {String} eventType - Enum value of the event (LOGIN, REGISTER, BLOCKED, etc.)
 * @param {Object} [logOptions] - Optional fields:
 *    - performedOn: user object being acted upon (for admin actions)
 *    - filter: for audit filtering logs
 */
const logAuthEvent = async (req, eventType, logOptions = {}) => {
    try {
        const userID = req.user?.userID || req.foundUser?.userID || null;
        const performedBy = eventType.toLowerCase().includes("token") ? "SYSTEM" : (req.user?.userType || req.foundUser?.userType || "CUSTOMER");
        
        const baseLog = {
            userID: userID,
            eventType: eventType,
            deviceID: req.deviceID,
            performedBy: performedBy
        };

        if (req.deviceName) baseLog.deviceName = req.deviceName;
        if (req.deviceType) baseLog.deviceType = req.deviceType;

        // Admin-specific target actions
        if (logOptions && (logOptions.performedOn?.userType || logOptions.filter)) {
            baseLog.adminAction = {
                create: {
                    targetUserID: logOptions?.adminAction?.targetUserID || null,
                    reason: req.body?.reason?.trim() || req.query?.reason?.trim() || logOptions?.adminAction?.reason?.trim() || null,
                    filter: logOptions?.filter || []
                }
            };
        }

        await prismaPrivate.authLog.create({
            data: baseLog
        });

        logWithTime(`📘 AuthLog saved successfully: ${eventType} | user: ${userID} | device: ${req.deviceID}`);

    } catch (err) {
        logWithTime(`❌ Internal Error saving AuthLog for event: ${eventType}`);
        errorMessage(err);
        return;
    }
};

const adminAuthLogForSetUp = async(user,eventType) => {
    try{
        const deviceID = user.devices?.info[0]?.deviceID || process.env.DEVICE_UUID;
        const baseLog = {
            userID: user.userID,
            eventType: eventType,
            deviceID: deviceID,
            performedBy: user.userType
        };

        baseLog.deviceName = user.devices?.info[0]?.deviceName || process.env.DEVICE_NAME;
        baseLog.deviceType = user.devices?.info[0]?.deviceType || process.env.DEVICE_TYPE;

        await prismaPrivate.authLog.create({
            data: {
                userID: baseLog.userID,
                eventType: baseLog.eventType,
                deviceID: baseLog.deviceID,
                deviceName: baseLog.deviceName,
                deviceType: baseLog.deviceType,
                performedBy: baseLog.performedBy
            }
        });

        logWithTime(`📘 AuthLog saved successfully: ${eventType} | user: ${user.userID} | device ID: ${deviceID}`);

    }catch(err){
        logWithTime(`❌ Internal Error saving AuthLog for Admin event: ${eventType} at set up phase`);
        errorMessage(err);
        return;
    }
};

module.exports = {
    logAuthEvent: logAuthEvent,
    adminAuthLogForSetUp: adminAuthLogForSetUp
};
