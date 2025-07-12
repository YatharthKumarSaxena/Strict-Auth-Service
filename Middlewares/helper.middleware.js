// Extracting required Modules, their functions and values
const { throwInvalidResourceError, throwResourceNotFoundError, throwInternalServerError, errorMessage, logMiddlewareError, getLogIdentifiers } = require("../configs/error-handler.configs");
const prisma = require("../clients/public.prisma");
const { logWithTime } = require("../utils/time-stamps.utils");
const { isValidUserID, isValidEmail, isValidFullPhoneNumber } = require("../utils/user-validators.utils");

const checkUserID = (userID,req,res) => {
    const isUserIDValid = isValidUserID(userID,res);
    if(!isUserIDValid){
        logMiddlewareError("Fetch User, userID provided is invalid",req);
        return false;
    }
    return true;
}

const checkEmailID = (emailID,req,res) => {
    const isEmailIDValid = isValidEmail(emailID,res);
    if(!isEmailIDValid){
        logMiddlewareError("Fetch User, emailID provided is invalid",req);
        return false;      
    }
    return true;
}

const checkFullPhoneNumber = (fullPhoneNumber,req,res) => {
    const isFullPhoneNumberValid = isValidFullPhoneNumber(fullPhoneNumber,res);
    if(!isFullPhoneNumberValid){
        logMiddlewareError("Fetch User, full phone number is invalid",req);
        return false;
    }
    return true;
}

const fetchUser = async(req,res) =>{
    try{
        let user;
        let verifyWith = "";
        let anyResourcePresent = true;
        if(req?.query?.userID){
            const userID = req.query.userID.trim();
            const validateUserID = checkUserID(userID,req,res);
            if(!validateUserID)return;
            user = await prisma.user.findUnique({
                where: {userID: userID}
            });
            if(user){
                verifyWith = verifyWith+"USER_ID";
            }
        }
        else if (req?.query?.emailID){
            const emailID = req.query.emailID.trim().toLowerCase();
            const validateEmailID = checkEmailID(emailID,req,res);
            if(!validateEmailID)return;
            user = await prisma.user.findUnique({
                where: {emailID: emailID}
            });
            if(user){
                verifyWith = verifyWith+"EMAIL";
            }
        }
        else if (req?.query?.fullPhoneNumber){
            const fullPhoneNumber = req.query.fullPhoneNumber.trim();
            const validatePhoneNumber = checkFullPhoneNumber(fullPhoneNumber,req,res);
            if(!validatePhoneNumber)return;
            user = await prisma.user.findUnique({
                where: {fullPhoneNumber: fullPhoneNumber}
            });
            if(user){
                verifyWith = verifyWith+"PHONE";
            }
        }
        else if(req?.body?.userID){
            const userID = req.body.userID.trim();
            const validateUserID = checkUserID(userID,req,res);
            if(!validateUserID)return;
            user = await prisma.user.findUnique({
                where: {userID: req.body.userID.trim()}
            });
            if(user){
                verifyWith = verifyWith+"USER_ID";
            }
        }else if(req?.body?.emailID){
            const emailID = req.body.emailID.trim().toLowerCase();
            const validateEmailID = checkEmailID(emailID,req,res);
            if(!validateEmailID)return;
            user = await prisma.user.findUnique({
                where: {emailID: req.body.emailID.trim().toLowerCase()}
            });
            if(user){
                verifyWith = verifyWith+"EMAIL";
            }
        }else if(req?.body?.fullPhoneNumber){
            const fullPhoneNumber = req.body.fullPhoneNumber.trim();
            const validatePhoneNumber = checkFullPhoneNumber(fullPhoneNumber,req,res);
            if(!validatePhoneNumber)return;
            user = await prisma.user.findUnique({
                where: {fullPhoneNumber: fullPhoneNumber}
            });
            if(user){
                verifyWith = verifyWith+"PHONE";
            }
        }else{
            anyResourcePresent = false;
        }
        if(!anyResourcePresent){
            const resource = "Phone Number, Email ID or Customer ID (Any One of these field)";
            logMiddlewareError("Fetch User, No resource provided to identify User",req);
            throwResourceNotFoundError(res,resource);
            return verifyWith;
        }
        if(!user){
            logMiddlewareError("Fetch User, Unauthorized User details provided",req);
            throwInvalidResourceError(res, "Phone Number, Email ID or Customer ID");
            return verifyWith;
        }
        // Attach the verified user's identity source and the user object to the request 
        // This prevents redundant DB lookups in the controller and makes downstream logic cleaner and faster
        req.verifyWith = verifyWith;
        req.foundUser = user;
        logWithTime(`🆔 User identified using: ${verifyWith}`);
        return verifyWith;
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while fetching the User Request ${getIdentifiers}`);
        errorMessage(err);
        throwInternalServerError(res);
        return "";
    }
}

module.exports = {
    fetchUser: fetchUser
}