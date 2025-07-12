/* This file is of MiddleWare that will handle request flow between Router and Controller*/ 
/* This file decides whether request from Router must be sent to Controller or not */

// Flow of Request :- 
/* App(Express Server)->Routers->Middlewares->Controllers->Models */
/* If an Error Occured in Middleware then Middleware will throw an Error , Request will not be forwarded to Controller */

// Extracting the Required Modules
const { throwResourceNotFoundError, throwInternalServerError, errorMessage, throwAccessDeniedError, throwConflictError, getLogIdentifiers, logMiddlewareError } = require("../configs/error-handler.configs");
const { logWithTime } = require("../utils/time-stamps.utils");
const { fetchUser } = require("./helper.middleware");
const { validateSingleIdentifier } = require("../utils/auth.utils");
const { checkUserIsNotVerified } = require("../controllers/auth.controllers");
const { BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } = require("../configs/http-status.config");
const { isValidPassword, isValidEmail, isValidCountryCode, isValidNumber, isValidName } = require("../utils/user-validators.utils");

const verifySignUpBody = async (req,res,next) =>{
    // Validating the User Request
    try{
        if(!req.body || Object.keys(req.body).length === 0){
            logMiddlewareError("An Empty Sign Up Body", req);
            return throwResourceNotFoundError(res,"SignUp Body");
        }
        let {name,emailID,phoneNumber,password} = req.body;
        if(emailID)emailID = emailID.trim().toLowerCase();;
        if(password)password = password.trim();
        // Check name is present in Request Body or not
        if(name)name = name.trim();
        // Check if Name Field Provided Is It Valid Or Not
        if(typeof name === 'string' && name.length){
            const isNameValid = isValidName(name,res);
            if(!isNameValid){
                logMiddlewareError("Sign Up",req);
                return;
            }
            req.body.name = name;
        }
        let { countryCode,number } = phoneNumber || {};
        const missingFields = [];
        if (!emailID) missingFields.push("Email ID");
        if (!phoneNumber) missingFields.push("Phone Number");
        else {
            if (!countryCode) missingFields.push("Country Code field in Phone Number");
            if (!number) missingFields.push("Number field in Phone Number");
        }
        if (!password) missingFields.push("Password");
        else {
            // ✅ Move these two checks inside the "else" of password
            const isPasswordValid = isValidPassword(password,res);
            if(!isPasswordValid){
                logMiddlewareError("Sign Up",req);
                return;
            }
            req.body.password = password;
        }
        if(missingFields.length > 0){ // Throw Error as User Details are not properly given
            logMiddlewareError("Sign Up,Required Fields Missing",req);
            return throwResourceNotFoundError(res, missingFields.join(", "));
        }
        countryCode = countryCode.trim();
        number = number.trim();
        // 📧 Number Format Validation
        const isNumberValid = isValidNumber(number,res);
        if(!isNumberValid){
            logMiddlewareError("Sign Up",req);
            return;
        }
        req.body.phoneNumber.number = number;
        // 📧 Country Code Format Validation
        const isCountryCodeValid = isValidCountryCode(countryCode,res);
        if(!isCountryCodeValid){
            logMiddlewareError("Sign Up",req);
            return;  
        }
        req.body.phoneNumber.countryCode = countryCode;
        // 📧 Email Format Validation
        // ✅ Move these two checks inside the "else" of password
        const isEmailIDValid = isValidEmail(emailID,res);
        if(!isEmailIDValid){
            logMiddlewareError("Sign Up",req);
            return;
        }
        req.body.emailID = emailID;
        // Very next line should be:
        if (!res.headersSent) return next();
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while verifying the Sign up Request ${getIdentifiers}.`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const verifySignInBody = async (req,res,next) =>{
    // Validating the User SignIn Body
    try{
        if(!req.body || Object.keys(req.body).length === 0){
            logMiddlewareError("Empty Sign In Body",req);
            return throwResourceNotFoundError(res,"Body");
        }
        if(!req.body.password){
            logMiddlewareError("Sign In, Password Field Missing",req);
            return throwResourceNotFoundError(res,"Password");
        }
        const validateRequestBody = validateSingleIdentifier(req,res);
        if(!validateRequestBody)return;
        let verifyWith = await fetchUser(req,res);
        if(verifyWith === ""){
            logMiddlewareError("Sign In ,Provided User is unauthorized",req);
            return;
        }
        req.user = req.foundUser;
        // Very next line should be:
        if (!res.headersSent) return next();
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while verifying the Sign in Request ${getIdentifiers}.`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const verifySignOutBody = async (req,res,next) => {
    // Validating the User SignOut Body
    try{
        // ✅ Now Check if User is Already Logged Out 
        const isNotVerified = await checkUserIsNotVerified(req,res);
        if (isNotVerified) {
            logWithTime(`🚫 Logout Request Denied: User ${req.user.userID} is already logged out from device ID: ${req.deviceID}`);
            return throwConflictError(res,"User is already logged out.","Please login first before trying to logout again.");
        }
        // Very next line should be:
        if (!res.headersSent) return next();
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while verifying the Sign out Request ${getIdentifiers}.`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const verifyActivateUserAccountBody = async(req,res,next) => {
    // Validating Request Body
    try{
        if(!req.body || Object.keys(req.body).length === 0){
            logMiddlewareError("Empty Activate Account Body", req);
            return throwResourceNotFoundError(res,"Body");
        }
        const validateRequestBody = validateSingleIdentifier(req,res);
        if(!validateRequestBody)return;
        let verifyWith = await fetchUser(req,res);
        if(verifyWith === ""){
            logMiddlewareError("Activate Account, Unauthorized User Provided",req);
            return;
        }
        if(req.foundUser.userType === "ADMIN"){
            logWithTime(`🚫 Request Denied: Admin account with id: ${req.foundUser.userID} cannot be activated. Admin tried to do it from device ID: ${req.deviceID}.`);
            return throwAccessDeniedError(res, "Admin account cannot be activated. Admin is a system-level user and cannot be modified like a normal user.")
        }
        if(!req.body.password){
            logMiddlewareError("Activate Account, Password Field Missing", req);
            return throwResourceNotFoundError(res,"Password");
        }
        const user = req.foundUser;
        if(user.isActive === true){
            logMiddlewareError("Active Account, Account already active",req);
            return throwConflictError(res,"User Account is already Active.", "Please deactivate your account first before trying to activate again.");
        }
        // Very next line should be:
        if (!res.headersSent) return next();
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while verifying the Activate Account Request ${getIdentifiers}.`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const verifyDeactivateUserAccountBody = async(req,res,next) => {
    // Validating Request Body
    try{
        if(!req.body || Object.keys(req.body).length === 0){
            logMiddlewareError("Empty Deactivate Account Body", req);
            return throwResourceNotFoundError(res,"Body");
        }
        const user = req.user;
        const validateRequestBody = validateSingleIdentifier(req,res);
        if(!validateRequestBody)return;
        if(user.userType === "ADMIN"){
            logWithTime(`🚫 Request Denied: Admin account with id: ${req.user.userID} cannot be deactivated. Admin tried to do it from device ID: ${req.deviceID}.`);
            return throwAccessDeniedError(res, "Admin account cannot be deactivated. Admin is a system-level user and cannot be modified like a normal user.")
        }
        let verifyWith = await fetchUser(req,res);
        if(verifyWith === ""){
            logMiddlewareError("Deactivate Account, Unauthorized User Provided",req);
            return;
        }
        // Decativate account Require either Phone Number, Email ID or UserID for Verification along with Password
        if(user.userID !== req.foundUser.userID){ 
            logWithTime(`🚫 Deactivation Request Denied: Authenticated user ${user.userID} tried to deactivate another account ${req.foundUser.userID}`);
            return res.status(UNAUTHORIZED).json({
                success: false,
                message: "You are not authorized to deactivate this account.",
                reason: "Authenticated user and target user do not match."
            });
        }
        if(!req.body.password){
            logMiddlewareError("Deactivate Account, Password Field Missing",req);
            return throwResourceNotFoundError(res,"Password");
        }
        if(user.isActive === false){
            logMiddlewareError("Decativate Account, Account already deactive",req);
            return throwConflictError(res,"User Account is already Inactive.","Please activate your account first before trying to deactivate again.")
        }
        // Very next line should be:
        if (!res.headersSent) return next();
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while verifying the Deactivate Account Request ${getIdentifiers}.`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const verifyChangePasswordBody = async(req,res,next) => {
    try{
        if(req.user.userType === "ADMIN"){
            logWithTime(`🚫 Change Password Request Blocked: Admin ${req.user.userID} attempted to change password from device ${req.deviceID}`);
            return res.status(FORBIDDEN).json({
                success: false,
                message: "Admin password cannot be changed via this route.",
                reason: "Admin accounts are system-level and cannot be modified like regular users."
            });
        }
        if(!req.body || Object.keys(req.body).length === 0){
            logMiddlewareError("Empty Change Password Body",req);
            return throwResourceNotFoundError(res,"Body");
        }
        const { oldPassword,newPassword } = req.body;
        if(!oldPassword){
            logMiddlewareError("Change Password, Old Password Field Missing",req);
            return throwResourceNotFoundError(res,"Old Password");
        }
        if(!newPassword){
            logMiddlewareError("Change Password, New Password Field Missing",req);
            return throwResourceNotFoundError(res,"New Password");
        }
        if(oldPassword === newPassword){
            logMiddlewareError("Change Password, Old and New Password are same",req);
            return res.status(BAD_REQUEST).json({
                success: false,
                message: "New password must be different from your current password."
            });
        }
        const isPasswordValid = isValidPassword(newPassword, res);
        if(!isPasswordValid)return;
        if(!res.headersSent)return next();
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while verifying the Change Password Request ${getIdentifiers}.`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

module.exports = {
    verifySignUpBody: verifySignUpBody,
    verifySignInBody: verifySignInBody,
    verifySignOutBody: verifySignOutBody,
    verifyActivateUserAccountBody: verifyActivateUserAccountBody,
    verifyDeactivateUserAccountBody: verifyDeactivateUserAccountBody,
    verifyChangePasswordBody: verifyChangePasswordBody
}