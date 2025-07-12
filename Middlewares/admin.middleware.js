// Middleware Code For Admin Controller

const { throwResourceNotFoundError, errorMessage, throwInternalServerError, logMiddlewareError, getLogIdentifiers, throwInvalidResourceError } = require("../configs/error-handler.configs");
const { logWithTime } = require("../utils/time-stamps.utils");
const { validateSingleIdentifier } = require("../utils/auth.utils");
const { isValidRegex } = require("../utils/field-validators");
const { UUID_V4_REGEX } = require("../configs/regex.config");

// Verify Admin Body Request for Blocking / Unblocking a user
const verifyAdminBlockUnblockBody = async(req,res,next) => {
    try{
        if(!req.body || Object.keys(req.body).length === 0){
            logMiddlewareError("Empty Block/Unblock Body",req);
            return throwResourceNotFoundError(res,"Body");
        }
        if(!req.body.reason){
            logMiddlewareError("Block/Unblock Account, Missing Reason Field",req);
            return throwResourceNotFoundError(res,"Reason");
        }
        if(!req.body.userID && !req.body.phoneNumber && !req.body.emailID){
            logMiddlewareError("Block/Unblock Account, Missing User Details to be blocked/unblocked",req);
            return throwResourceNotFoundError(res,"EmailID, UserID or Phone Number(Any one of these fields)");
        }
        const validateRequestBody = validateSingleIdentifier(req,res);
        if(!validateRequestBody)return;
        // Very next line should be:
        if (!res.headersSent) return next();
    }catch(err){
        const userID = req?.foundUser?.userID || "Unauthorized User";
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ Internal Error occurred while verifying the Admin Body Request (${getIdentifiers}) on user with userID: (${userID})`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}   

// Verify Admin Body Request for Blocking / Unblocking a user
const verifyAdminBlockUnblockDeviceBody = async(req,res,next) => {
    try{
        if(!req.body || Object.keys(req.body).length === 0){
            logMiddlewareError("Empty Block/Unblock Body",req);
            return throwResourceNotFoundError(res,"Body");
        }
        if(!req.body.reason){
            logMiddlewareError("Block/Unblock Device, Missing Reason Field",req);
            return throwResourceNotFoundError(res,"Reason");
        }
        if(!req.body.deviceID){
            logMiddlewareError("Block/Unblock Device, Missing Device Details i.e Device ID to be blocked/unblocked",req);
            return throwResourceNotFoundError(res,"Device ID");
        }
        if(!isValidRegex(req.body.deviceID,UUID_V4_REGEX)){
            logMiddlewareError("Block/Unblock Device, Invalid Device ID Format to be blocked/unblocked",req);
            return throwInvalidResourceError(res,"Device ID, Please provide a valid device id format");          
        }
        // Very next line should be:
        if (!res.headersSent) return next();
    }catch(err){
        const deviceID = req?.body?.deviceID || "Unauthorized Device";
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ Internal Error occurred while verifying the Admin Body Request (${getIdentifiers}) on device with deviceID: (${deviceID})`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}   

const verifyAdminCheckUserSessionsBody = async(req,res,next) => {
    try{
        const validateRequestBody = validateSingleIdentifier(req,res,"query");
        if(!validateRequestBody)return;
        if (!(req.query.userID || req.query.emailID || req.query.phoneNumber)) {
            logMiddlewareError("Admin Check User Sessions Body, Missing User Details whose session details need to be checked",req);
            return throwResourceNotFoundError(res, "User Identifier (userID/emailID/phoneNumber)");
        }
        if(!req.query.reason){
            logMiddlewareError("Admin Check User Sessions Body, Missing Reason Field",req);
            return throwResourceNotFoundError(res,"Reason");
        }
        // Very next line should be:
        if (!res.headersSent) return next();
    }catch(err){
        const userID = req?.foundUser?.userID || "Unauthorized User";
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ Internal Error occurred while verifying the Admin Body Request (${getIdentifiers}) on user with userID: (${userID})`);
        errorMessage(err);
        return throwInternalServerError(res); 
    }
}

module.exports = {
    verifyAdminBlockUnblockBody: verifyAdminBlockUnblockBody,
    verifyAdminCheckUserSessionsBody: verifyAdminCheckUserSessionsBody,
    verifyAdminBlockUnblockDeviceBody: verifyAdminBlockUnblockDeviceBody
}