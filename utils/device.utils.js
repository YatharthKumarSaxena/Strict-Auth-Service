const { logWithTime } = require("../utils/time-stamps.utils");
const { errorMessage,throwInternalServerError } = require("../configs/error-handler.configs");
const prisma = require("../clients/public.prisma");
const { FORBIDDEN } = require("../configs/http-status.config");

// 📦 Utility to get a device from user's device by deviceID
const getDeviceByID = async (user, deviceID) => {
    // 🛠 Re-fetch fresh user from DB to ensure up-to-date device list
    user = await prisma.user.findUnique({
        where:{ userID: user.userID },
        include: { device: true }
    });
    // 🔍 Check if device not exist
    if (!user?.device) return null;
    // 🔎 Check device belongs to User or not
    if (user.device && user.device.deviceID === deviceID)return user.device;
    return null;
};

const checkUserDeviceLimit = (req,res) => {
    const user = req.user || req.foundUser;
    if (user.device) {
        logWithTime(`Login Request Denied as User (${user.userID}) is logged in on another device. Request is made from deviceID: (${req.deviceID})`);
        res.status(FORBIDDEN).json({ 
            success: false,
            message: "❌ You are logged in on another device. Please logout from that device." 
        });
        return true;
    }
    return false;
}

const checkDeviceThreshold = async (deviceID,res) => {
    try {

        const usersUsingDevice = await prisma.device.findUnique({
            where: { deviceID: deviceID }
        });

        if (usersUsingDevice) {
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