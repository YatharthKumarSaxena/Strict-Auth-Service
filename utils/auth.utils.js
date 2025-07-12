const { errorMessage,throwInternalServerError,throwInvalidResourceError } = require("../configs/error-handler.configs");
const { logWithTime } = require("../utils/time-stamps.utils");
const prisma = require("../clients/public.prisma");
const bcryptjs = require("bcryptjs");
const { BAD_REQUEST } = require("../configs/http-status.config");
const { isValidRegex,validateLength } = require("../utils/field-validators");
const { fullPhoneNumberRegex } = require("../configs/regex.config");
const { fullPhoneNumberLength } = require("../configs/fields-length.config");
const { clearAccessTokenCookie } = require("./cookie-manager.utils");
const { isValidFullPhoneNumber } = require("./user-validators.utils");

const validateSingleIdentifier = (req, res, source = 'body') => {
    const identifierKeys = ['userID', 'emailID', 'fullPhoneNumber'];

    // 👇 This ensures both req.body and req.query work reliably
    const data = source === 'query' ? Object.assign({}, req.query) : req.body;

    const validIdentifiers = identifierKeys.filter(key =>
        data.hasOwnProperty(key) && typeof data[key] === 'string' && data[key].trim() !== ''
    );

    if (validIdentifiers.length !== 1) {
        logWithTime(`🧷 Invalid input: More than one or no identifier provided from device id: (${req.deviceID}).`);
        res.status(BAD_REQUEST).send({
            success: false,
            message: "❌ Provide exactly one identifier: userID, phoneNumber, or emailID."
        });
        return false;
    }

    // 🧼 Remove extra identifiers
    const selectedKey = validIdentifiers[0];
    identifierKeys.forEach(key => {
        if (key !== selectedKey && key in data) {
            delete data[key];
        }
    });

    logWithTime(`🧩 Valid identifier input detected from device id: (${req.deviceID}).`);
    return true;
};



// ✅ SRP: This function only checks for existing users via phoneNumber or emailID
const checkUserExists = async(emailID,fullPhoneNumber,res) => {
    try{
        let count = 0;
        let user = await prisma.user.findUnique({where:{fullPhoneNumber: fullPhoneNumber}})
        let reason = "";
        if(user){
            logWithTime("⚠️ User Already Exists with Phone Number: "+fullPhoneNumber);
            reason = "Phone Number: "+fullPhoneNumber;
            count++;
        }
        user = await prisma.user.findUnique({where:{emailID: emailID}});
        if(user){
            logWithTime("⚠️ User Already Exists with Email ID: "+emailID);
            if(count)reason= "Phone Number: "+fullPhoneNumber+" and Email ID: "+emailID;
            else reason = "Email ID: "+emailID;
            count++;
        }
        if(count!==0)logWithTime("⚠️ Invalid Registration");
        return reason;
    }catch(err){
        logWithTime(`❌ An Internal Error occurred while checking existing user with phone number: (${fullPhoneNumber}) and emailID: (${emailID}).`);
        errorMessage(err);
        throwInternalServerError(res);
        return "";
    }
}

const checkAndAbortIfUserExists = async (emailID, fullPhoneNumber, res) => {
  const userExistReason = await checkUserExists(emailID, fullPhoneNumber, res);
  if (userExistReason !== "") {
    logWithTime(`⛔ Conflict Detected: ${userExistReason}`);
    if (!res.headersSent) {
      res.status(BAD_REQUEST).json({
        success: false,
        message: "User Already Exists with " + userExistReason,
        warning: "Use different Email ID or Phone Number or both based on Message"
      });
    }
    return true; // signal that response is already sent or conflict detected
  }
  return false;
};

const checkPasswordIsValid = async(req,user) => {
    const providedPassword = req.body.password || req.body.oldPassword;
    const userWithPassword = await prisma.user.findUnique({
        where: { userID: user.userID },
        select: { password: true } 
    });
    if (!userWithPassword) return false;
    const actualPassword = userWithPassword.password;
    const isPasswordValid = await bcryptjs.compare(providedPassword, actualPassword);
    return isPasswordValid;
}

const isAdminID = (userID) => {
    return typeof userID === "string" && userID.startsWith("ADM");
};

const createFullPhoneNumber = (req,res) => {
    try{
        const { countryCode,number } = req.body.phoneNumber;
        const newNumber = "+" + countryCode + number;
        const isFullPhoneNumberValid = isValidFullPhoneNumber();
        if(!isFullPhoneNumberValid)return null;
        const userID = req.user?.userID || req?.foundUser?.userID || "New User";
        logWithTime(`Full Phone Number Created Successfully for User with ${userID}`)
        return newNumber;
    }catch(err){
        const userID = req.user?.userID || req?.foundUser?.userID || "New User";
        logWithTime(`An Error Occurred while creating full phone number for User with ${userID}`);
        errorMessage(err);
        throwInternalServerError(res);
        return null;
    }
}

const loginTheUser = async (user, device, res) => {
    try {
        await prisma.user.update({
            where: {userID: user.userID},
            data: {
                isVerified: true,
                lastLogin: new Date(),
                loginCount: {increment: 1},
            }
        });
        await prisma.device.upsert({
            where: { userID: user.userID },
            update: {
                lastUsedAt: new Date(),
                deviceType: device.deviceType || undefined,
                deviceName: device.deviceName || undefined
            },
            create: {
                deviceID: device.deviceID,
                userID: user.userID,
                deviceType: device.deviceType || undefined,
                deviceName: device.deviceName || undefined,
                lastUsedAt: new Date()
            }
        });
        return true;
    } catch (err) {
        logWithTime(`❌ Internal Error occurred while logging in user (${user.userID})`);
        errorMessage(err);
        throwInternalServerError(res);
        return false;
    }
};

// 🧠 auth.controller.js or auth.service.js
const logoutUserCompletely = async (user, res, req, context = "general") => {
    try {
        await prisma.device.delete({
            where: { userID: user.userID }
        });

        await prisma.user.update({
            where: {userID: user.userID},
            data: {
                isVerified: false,
                lastLogout: new Date(),
                jwtTokenIssuedAt: null
            }
        });

        const isCookieCleared = clearAccessTokenCookie(res);
        if (!isCookieCleared) {
            logWithTime(`❌ Cookie clear failed for user (${user.userID}) during ${context}. Device ID: (${req.deviceID})`);
            return false;
        }

        logWithTime(`👋 User (${user.userID}) logged out successfully from all devices during ${context}. Device ID: (${req.deviceID})`);
        return true;
    } catch (err) {
        logWithTime(`❌ Error while logging out user (${user.userID}) during ${context}. Device ID: (${req.deviceID})`);
        errorMessage(err);
        throwInternalServerError(res);
        return false;
    }
};

module.exports = {
  checkAndAbortIfUserExists: checkAndAbortIfUserExists,
  validateSingleIdentifier: validateSingleIdentifier,
  createFullPhoneNumber: createFullPhoneNumber,
  logoutUserCompletely: logoutUserCompletely,
  checkPasswordIsValid: checkPasswordIsValid,
  checkUserExists: checkUserExists,
  loginTheUser: loginTheUser,
  isAdminID: isAdminID
}