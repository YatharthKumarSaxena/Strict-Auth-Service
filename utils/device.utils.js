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

const checkDeviceThreshold = async (deviceID, res) => {
    try {

        const usersUsingDevice = await prisma.device.findUnique({
            where: { deviceID: deviceID }
        });

        if (usersUsingDevice) {
            logWithTime(`🛑 Device Threshold Exceeded: Device (${deviceID}) is already linked with one user.`);
            res.status(FORBIDDEN).json({
                success: false,
                message: "❌ Device limit reached. A user is already signed in on this device."
            });
            return true;
        }
        return false;
    } catch (error) {
        logWithTime(`❌ Internal Error during Device Threshold Check for (${deviceID}):`, error);
        throwInternalServerError(res);
        return true;
    }
};

const createDeviceField = (req,res) => {
    try{
        const device = {
            deviceID: req.deviceID,
            addedAt: Date.now(),
            lastUsedAt: Date.now()
        };
        if(req.deviceName)device.deviceName = req.deviceName;
        if(req.deviceType)device.deviceType = req.deviceType;
        return device;
    }catch(err){
        logWithTime(`🛑 An Error Occured in making the Device Field during SignUp/SignIn for user having userID: (${req.body.userID})`)
        errorMessage(err);
        throwInternalServerError(res);
        return null;
    }
}

module.exports = {
    getDeviceByID: getDeviceByID,
    createDeviceField: createDeviceField,
    checkUserDeviceLimit: checkUserDeviceLimit,
    checkDeviceThreshold: checkDeviceThreshold
}