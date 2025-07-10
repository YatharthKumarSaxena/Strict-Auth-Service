// Extracting the Required Modules
const jwt = require("jsonwebtoken");
const prisma = require("../clients/public.prisma");
const { UUID_V4_REGEX } = require("../configs/regex.config");
// Extracting Required Functions and Values

const { logWithTime } = require("../utils/time-stamps.utils");
const { throwAccessDeniedError, errorMessage, throwInternalServerError, throwResourceNotFoundError, throwInvalidResourceError, throwBlockedAccountError, getLogIdentifiers, logMiddlewareError } = require("../configs/error-handler.configs");
const { secretCodeOfAccessToken } = require("../configs/security.config");
const { fetchUser } = require("./helper.middleware");
const { extractAccessToken } = require("../utils/extract-token.utils");
const { getDeviceByID } = require("../utils/device.utils");
const { DEVICE_TYPES } = require("../configs/user-enums.config");
const { checkUserIsNotVerified } = require("../controllers/auth.controllers");
const {  FORBIDDEN } = require("../configs/http-status.config");
const { validateLength, isValidRegex } = require("../utils/field-validators");
const { deviceNameLength } = require("../configs/fields-length.config");

// ✅ Checking if User Account is Active
const isUserAccountActive = async(req,res,next) => {
    try{
        let user = req.user || req.foundUser;
        if(!user){
            const verifyWith = await fetchUser(req,res);
            if(verifyWith === ""){
                logWithTime(`❌ User not found while checking account active status on device id: (${req.deviceID})`);
                return throwResourceNotFoundError(res, "User");
            }
            req.user = req.foundUser; // 🧷 Attach for future use
            user = req.user;
        }
        if(user.userType === "ADMIN"){ // Admin Account can never be deactivated
            // Very next line should be:
            if (!res.headersSent) return next();
        }
        if(user.isActive === false){
            logWithTime(`🚫 Access Denied: User Account (${user.userID}) is Deactivated on device id: (${req.deviceID})`);
            res.status(FORBIDDEN).json({
                success: false,
                message: "Your account is currently deactivated.",
                suggestion: "Please activate your account before continuing."
            });
            return;
        }
        // ✅ Active User – Allow to proceed
        // Very next line should be:
        if (!res.headersSent) return next();
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while checking User Account is active or not ${getIdentifiers}`);
        errorMessage(err);
        if (!res.headersSent) {
            return throwInternalServerError(res);
        }
    }  
}

// Checking User is Blocked
const isUserBlocked = async(req,res,next) => {
    try{
        let user = req.user || req.foundUser;
        if(!user){
            const verifyWith = await fetchUser(req,res);
            if(verifyWith === ""){
                logMiddlewareError("Is User Blocked, Unauthorized or Invalid User Identifier", req);
                return;
            }
            else {
                // Attached complete user details with request, save time for controller
                user = req.foundUser;
                req.user = req.foundUser;
            }
        }
        if(user.userType === "ADMIN"){
            if(!res.headersSent)return next();
        }
        else{
            if(user.isBlocked){
                logWithTime(`⚠️ Blocked User Account is denied access whose user id is (${user.userID}) on device id: (${req.deviceID})`);
                return throwBlockedAccountError(req,res);
            };
            // Very next line should be:
            if (!res.headersSent) return next();
        }
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while checking User is blocked or not ${getIdentifiers}`);
        errorMessage(err);
        if (!res.headersSent) {
            return throwInternalServerError(res);
        }
    }
}

// Check that User is Verified or Not
// Act as middleware for verifyToken and isAdmin function
const checkUserIsVerified = async(req,res,next) => {
    try{
        let user = req.user;
        if(!user){
            let userID = req?.user?.userID || req?.body?.userID;
            user = await prisma.user.findUnique({
                where: { userID: userID }
            });
            if (!user) {
                logMiddlewareError("Check Verified User, No user found using provided identifier", req);
                return throwResourceNotFoundError(res, "User");
            }
            req.user = user; // 🧷 Attach for future use
        }
        const deviceID = req.deviceID;
        // Check whether Device ID belongs to User or Not
        const device = await getDeviceByID(user,deviceID);
        if(!device){
            logMiddlewareError("Check Verified User, Device ID not found or does not belong to user", req);
            return throwInvalidResourceError(res,"Device ID");
        }
        const isNotVerified = await checkUserIsNotVerified(req,res);
        if(isNotVerified){
            logWithTime(`⏰ Session expired for User (${user.userID}). Please log in again to continue accessing your account.`);
            return res.status(FORBIDDEN).json({
                success: false,
                message: "⏰ Session expired. Please log in again to continue accessing your account.",
                code: "TOKEN_EXPIRED"
            })
        }
        await prisma.device.update({
            where: {deviceID: req.deviceID},
            data: {
                lastUsedAt: new Date()
            }
        })
        // Very next line should be:
        if (!res.headersSent) return next();
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while checking User is verified or not ${getIdentifiers}`);
        errorMessage(err);
        if (!res.headersSent) {
            return throwInternalServerError(res);
        }
    }
}

// Checking Provided Request is given by admin or not
const isAdmin = (req,res,next) => {
    try{
        const user = req.user;
        if (!user) {
            logMiddlewareError("Is Admin, No user info present in request", req);
            return throwAccessDeniedError(res, "User");
        }
        if(user.userType === "ADMIN"){
            // Very next line should be:
            if (!res.headersSent) return next(); // Checking Provided User ID matches with Admin ID
        }
        else{
            // Admin not present, access denied
            logMiddlewareError(`Is Admin, Access Denied for non-admin user: (${user.userID})`, req);
            return throwAccessDeniedError(res,"Admin, Admins only");
        }
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while checking User is Admin or not ${getIdentifiers}`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const verifyToken = async (req, res, next) => {
    try {
        const accessToken = extractAccessToken(req);
        
        if (!accessToken) {
            logMiddlewareError("Verify Token, Access Token Missing", req);
            return throwResourceNotFoundError(res, "Access token");
        }

        let decodedAccess;
        try {
            decodedAccess = jwt.verify(accessToken, secretCodeOfAccessToken); // ID must match Prisma's UUID
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                logWithTime(`⏰ Token expired. Device ID: ${req.deviceID}`);
                return res.status(403).json({
                    success: false,
                    message: "Access token expired. Please login again.",
                    code: "TOKEN_EXPIRED"
                });
            } else {
                logWithTime(`🚫 Invalid token. Device ID: ${req.deviceID}`);
                return throwInvalidResourceError(res, "Access Token");
            }
        }

        // 🔍  Fetch the user based on UUID from token
        const user = await prisma.user.findUnique({
            where: { id: decodedAccess.id }
        });

        if (!user) {
            logMiddlewareError("Verify Token, No user found with this token", req);
            return throwResourceNotFoundError(res, "User");
        }

        // ✅ Attach user object to request
        req.user = user;
        logWithTime(`✅ Token verified. User (${user.userID}) on Device: ${req.deviceID}`);

        if (!res.headersSent) return next();

    } catch (err) {
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ Error while verifying token ${getIdentifiers}`);
        errorMessage(err);
        if (!res.headersSent) return throwInternalServerError(res);
    }
};


const verifyDeviceField = async (req,res,next) => {
    try{
        const deviceID = req.headers["x-device-uuid"];
        let deviceName = req.headers["x-device-name"]; // Optional
        const deviceType = req.headers["x-device-type"]; // Optional
        // Device ID is mandatory
        if (!deviceID || deviceID.trim() === "") {
            logWithTime("Verify Device Field, Device ID field Missing");
            return throwResourceNotFoundError(res, "Device UUID (x-device-uuid) is required in request headers");
        }
        // Attach to request object for later use in controller
        req.deviceID = deviceID.trim();
        if (!isValidRegex(deviceID,UUID_V4_REGEX)) {
            logMiddlewareError("Verify Device Field, Invalid Device ID format",req);
            return throwInvalidResourceError(res, `Device UUID, Provided Device UUID (${req.deviceID}) is not in a valid UUID v4 format`);
        }
        if (deviceName && deviceName.trim() !== "") {
            deviceName = deviceName.trim();
            if(!validateLength(deviceName,deviceNameLength.min,deviceNameLength.max)){
                logMiddlewareError(`Verify Device Field, Invalid Device Name length.`,req);
                return throwAccessDeniedError(res, `Device Name length should be between ${deviceNameLength.min} and ${deviceNameLength.max} characters`);
            }
        }
        if (deviceType && deviceType.trim() !=="") {
            const type = deviceType.toUpperCase().trim();
            if (!DEVICE_TYPES.includes(type)) {
                logMiddlewareError("Verify Device Field, Invalid Device Type Provided",req);
                return throwInvalidResourceError(res, `Device Type. Use Valid Device Type: ${DEVICE_TYPES}`);
            }
            req.deviceType = type;
        }
        if(!res.headersSent)next(); // Pass control to the next middleware/controller
    }catch(err){
        const deviceID = req.headers["x-device-uuid"] || "Unauthorized Device ID"
        logWithTime(`⚠️ Error occurred while validating the Device field having device id: ${deviceID}`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const verifySetAdminCookieBody = async(req,res,next) => {
    try{
        if(!req.body || Object.keys(req.body).length === 0){
            logWithTime(`⚠️ Access Denied as no body provided for Admin to set up cookie from device id : (${req.deviceID})`);
            return throwResourceNotFoundError(res,"Body");
        }
        const accessToken = req.body.accessToken;
        if(!accessToken){
            logWithTime(`⚠️ Access Denied to Set Cookie for Admin as no access token provided in body. Request is made from device id: (${req.deviceID})`);
            return throwResourceNotFoundError(res, "Access Token");
        }
        let decodedAccess;
        try {
            decodedAccess = jwt.verify(accessToken, secretCodeOfAccessToken);
        } catch (err) {
            logWithTime(`⚠️ Access token provided is invalid or expired.So Access Denied for Set up Admin Cookie. Request is made from device id: (${req.deviceID})`);
            return throwInvalidResourceError(res,"Access token");
        }
        const user = await prisma.user.findUnique({
            where: { id: decodedAccess.id }
        });
        if(!user){
            logWithTime(`⚠️ Access Denied as Invalid Access Token provided by Admin to set up cookie from device id : (${req.deviceID})`)
            return throwInvalidResourceError(res,"User");
        }
        // Check Access Token belongs to Admin Or Not
        req.user = user;
        if(!res.headersSent)return next();
    }catch(err){
        logWithTime(`⚠️ Error occurred while validating the set admin cookie body , made from device id: (${req.deviceID})`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
};

module.exports = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    checkUserIsVerified: checkUserIsVerified,
    isUserBlocked: isUserBlocked,
    isUserAccountActive: isUserAccountActive,
    verifyDeviceField: verifyDeviceField,
    verifySetAdminCookieBody: verifySetAdminCookieBody
}