// Extract the required Module
const jwt = require("jsonwebtoken");
const {secretCodeOfAccessToken} = require("../configs/admin-user.config");
const {expiryTimeOfAccessToken} = require("../configs/token-expiry.config");
const { logWithTime } = require("./time-stamps.utils");
const { errorMessage, throwInternalServerError } = require("../configs/error-handler.configs");
const { logAuthEvent, adminAuthLogForSetUp } = require("../utils/auth-log-utils");
const authLogEvents = require("../configs/auth-log-events.config");

exports.makeTokenWithPrismaID = async(req,res) => {
    try {
        const user = req.user;
        const prismaID = user.id;
        const secretCode = secretCodeOfAccessToken;
        const newToken = jwt.sign(
            {
                id: prismaID,          
            },
            secretCode,
            { expiresIn: expiryTimeOfAccessToken }
        );
        // Update data into auth.logs
        await logAuthEvent(req, authLogEvents.ACCESS_TOKEN , null);
        logWithTime(`✅ Access Token successfully created for user: ${user.userID}. Request is made from deviceID: (${req.deviceID})`);
        return newToken;
    } catch (err) {
        logWithTime("`❌ An Internal Error Occurred while creating the token");
        errorMessage(err);
        throwInternalServerError(res);
        return null;
    }
};

exports.makeTokenWithPrismaIDForAdmin = async(user) => {
    try {
        const prismaID = user.id;
        const secretCode = secretCodeOfAccessToken;
        const newToken = jwt.sign(
            {
                id: prismaID,          
            },
            secretCode,
            { expiresIn: expiryTimeOfAccessToken }
        );
        // Update data into auth.logs
        await adminAuthLogForSetUp(user, authLogEvents.ACCESS_TOKEN, null);
        const deviceID = user?.device?.deviceID || "Unknown";
        logWithTime(`✅ Access Token successfully created for user: ${user.userID}. Request is made from deviceID: (${deviceID})`);
        return newToken;
    } catch (err) {
        logWithTime("`❌ An Internal Error Occurred while creating the token for Admin");
        errorMessage(err);
        return null;
    }
};

