const { logWithTime } = require("../utils/time-stamps.utils");
const { errorMessage,throwInternalServerError } = require("../configs/error-handler.configs");
const prisma = require("../clients/public.prisma");
const { FORBIDDEN } = require("../configs/http-status.config");
const { expiryTimeOfAccessToken } = require("../configs/security.config");
const { logoutUserCompletely } = require("../controllers/auth.controllers")

// 📦 Utility to get a device from user's device by deviceID
const getDeviceByID = async (user, deviceID) => {
    const device = await prisma.device.findUnique({
        where: { deviceID: deviceID }
    });

    if (!device) return null;

    // 🔐 Ensure the device actually belongs to the given user
    return device.userID === user.userID ? device : null;
};


const checkUserDeviceLimit = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { userID: req.user.userID },
            include: { device: true },
        });

        if (user.device) {
            logWithTime(`Login Request Denied as User (${user.userID}) is logged in on another device. Request is made from deviceID: (${req.deviceID})`);
            res.status(FORBIDDEN).json({
                success: false,
                message: "❌ You are logged in on another device. Please logout from that device."
            });
            return true;
        }

        return false;
    } catch (err) {
        logWithTime(`❌ Error while checking existing device for User (${req.user?.userID})`);
        errorMessage(err);
        throwInternalServerError(res);
        return true; // Block login as a safe fallback
    }
};


const checkDeviceThreshold = async (req,res) => {
    try {
        const deviceID = req.deviceID;
        const deviceUsed = await prisma.device.findUnique({
            where: { deviceID: deviceID }
        });
        // Check the Session is Expired on this Device or not
        const lastUsedTime = new Date(deviceUsed.lastUsedAt).getTime(); // In milli second current time is return
        const currentTime = Date.now(); // In milli second current time is return
        if(currentTime > lastUsedTime + expiryTimeOfAccessToken*1000){
            const oldUserID = deviceUsed.userID;

            // 👇 Fetch old user from DB
            const oldUser = await prisma.user.findUnique({ where: { userID: oldUserID } });

            // 👋 Log out old user completely (pass dummy req/res if needed)
            const isOldUserloggedOut = await logoutUserCompletely(oldUser, res, req, "device reassignment due to expiry");
            if(!isOldUserloggedOut){
                logWithTime(`🚫 Failed to logout old user (${oldUserID}) during reassignment of device (${deviceID})`);;
                return true;
            }
            return false; // Threshold not exceeded now
        }
        if (deviceUsed) {
            logWithTime(`🛑 Device Threshold Exceeded: Device (${deviceID}) is already linked with one user.`);
            return true;
        }
        return false;
    } catch (error) {
        logWithTime(`❌ Internal Error during Device Threshold Check for (${deviceID}):`, error);
        throwInternalServerError(res);
        return true;
    }
};

const createDevice = async (req, res) => {
    try {
        const deviceData = {
            deviceID: req.deviceID,
            userID: req.user.userID,
            addedAt: new Date(),
            lastUsedAt: new Date(),
            requestCount: 1,
        };
        if (req.deviceName) deviceData.deviceName = req.deviceName;
        if (req.deviceType) deviceData.deviceType = req.deviceType;

        const createdDevice = await prisma.device.create({
            data: deviceData
        });

        return createdDevice;
    } catch (err) {
        logWithTime(`❌ Error occurred while creating Device for user (${req.user?.userID}) with device ID: (${req.deviceID})`);
        errorMessage(err);
        throwInternalServerError(res);
        return null;
    }
};

module.exports = {
    createDevice: createDevice,
    getDeviceByID: getDeviceByID,
    checkUserDeviceLimit: checkUserDeviceLimit,
    checkDeviceThreshold: checkDeviceThreshold
}