/*  
  ✅ This file handles the logic for User Registration and User Login in the backend.
  It follows key principles of SOLID and DRY along with usage of important Design Patterns like:
  - Factory Pattern
  - Template Method Pattern
  - Singleton Pattern (via Mongo Document logic)
*/

// Extracting the required modules
const { SALT, expiryTimeOfAccessToken} = require("../configs/security.config");
const bcryptjs = require("bcryptjs")
const { throwInvalidResourceError, errorMessage, throwInternalServerError, getLogIdentifiers, throwResourceNotFoundError } = require("../configs/error-handler.configs");
const { logWithTime } = require("../utils/time-stamps.utils");
const { makeTokenWithPrismaID } = require("../utils/issue-token.utils");
const { checkPasswordIsValid, createFullPhoneNumber,  checkAndAbortIfUserExists } = require("../utils/auth.utils");
const { signInWithToken } = require("../services/token.service");
const { makeUserID } = require("../services/userID.service");
const { createDevice, checkDeviceThreshold, checkUserDeviceLimit } = require("../utils/device.utils");
const { logAuthEvent } =require("../utils/auth-log-utils");
const { setAccessTokenCookie, clearAccessTokenCookie } = require("../utils/cookie-manager.utils");
const { CREATED, INSUFFICIENT_STORAGE, INTERNAL_ERROR, OK, FORBIDDEN } = require("../configs/http-status.config");
const authLogEvents = require("../configs/auth-log-events.config");
const prisma = require("../clients/public.prisma")

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

// DRY Principle followed by this Code
const checkUserIsNotVerified = async(req,res) => {
    try{
        const user = req.user || req.foundUser;
        if(user.isVerified === false)return true; // SignOut Introduces this Feature
        if (!user.jwtTokenIssuedAt) {
            logWithTime(`⚠️ Missing jwtTokenIssuedAt for user (${user.userID}). Logging out as precaution.`);
            const isUserLoggedOut = await logoutUserCompletely(user, res, req, "missing jwtTokenIssuedAt in checkUserIsNotVerified");
            if (isUserLoggedOut) return true;
            return false;
        }
        const tokenIssueTime = new Date(user.jwtTokenIssuedAt).getTime(); // In milli second current time is return
        const currentTime = Date.now(); // In milli second current time is return
        if(currentTime > tokenIssueTime + expiryTimeOfAccessToken*1000){ // expiryTimeOfJWTtoken is in second multiplying by 1000 convert it in milliseconds
            const isUserLoggedOut = await logoutUserCompletely(user,res,req,"in check user is not verfied function")
            if(isUserLoggedOut)return true;
            return false; // 🧠 session expired, response already sent
        }
        return false; // ✅ token valid, continue execution
    }catch(err){
        logWithTime(`❌ An Internal Error Occurred while verifying the User Request`);
        errorMessage(err);
        throwInternalServerError(res);
        return true;
    }
}

/*
  ✅ Template Method Pattern:
  The `signUp()` function acts as a template that:
    1. Extracts request
    2. Generates a user ID
    3. Encrypts password
    4. Saves to DB
    5. Sends response
  This linear fixed structure is characteristic of the Template Method Design Pattern.

  ✅ SRP:
  Handles the single responsibility of registration workflow.

  ✅ DRY:
  Uses `throwErrorResponse()` and `errorMessage()` for consistency.
*/

/* Logic to Create User i.e User Registration */
const signUp = async (req,res) => { // Made this function async to use await
    /* 1. Read the User Request Body */
    const request_body = req.body; // Extract User Data from the User Post Request
    let emailID = request_body.emailID;

    /*
      ✅ SRP: User object is composed here only once after getting all required parts.
      ✅ DRY: Hash logic is abstracted via bcryptjs.
    */

    const newNumber = createFullPhoneNumber(req,res);
    if(!newNumber)return;
    
    // Checking User already exists or not 
    const userExist = await checkAndAbortIfUserExists(emailID, newNumber, res);
    if(userExist)return;
    const password = await bcryptjs.hash(request_body.password, SALT); // Password is Encrypted

    /* 2. Insert the Data in the Users Collection of Mongo DB ecomm_db Database */ 
    let generatedUserID; // To resolve Scope Resolution Issue
    try{
        generatedUserID= await makeUserID(res); // Generating Customer ID 
        if (generatedUserID === "") { // Check that Machine can Accept More Users Data or not
            return res.status(INSUFFICIENT_STORAGE).json({
                success: false,
                message: "User limit reached. Cannot register more users at this time."
            });
        }
    }catch(err){
        logWithTime(`⚠️ Error Occured while making the User ID of Phone Number: (${req.body.phoneNumber}) and EmailID (${req.body.emailID}) from device id: (${req.deviceID})`);
        errorMessage(err);
        return throwInternalServerError(res);
    }

    const { countryCode,number } = request_body.phoneNumber;
    try{
        const user = await prisma.user.create({
            data: {
                fullPhoneNumber: newNumber,
                emailID: request_body.emailID,
                password: password,
                userID: generatedUserID,
                name: request_body.name || undefined
            }
        });
        if(request_body.name){
            await prisma.user.update({
                where: {userID: generatedUserID},
                data: {
                    name: request_body.name
                }
            })
        }
        logWithTime(`🟢 User (${user.userID}) Created Successfully`);
        await prisma.phoneNumber.create({
            data: {
                userID: user.userID,
                countryCode: countryCode,
                number: number
            }
        });
        logWithTime(`🟢 Phone Number (${user.fullPhoneNumber}) is linked successfully to User (${user.userID})`);
        req.user = user;
        const userGeneralDetails = {
            emailID: user.emailID,
            userID: user.userID,
            fullPhoneNumber: newNumber,
            userType: user.userType,
            createdAt: user.createdAt
        }
        if(user.name)userGeneralDetails.name = request_body.name;
        // Update data into auth.logs
        await logAuthEvent(req, "REGISTER", null);
        const userDisplayDetails = {
            details:"Here is your Basic Profile Details given below:-", 
            userID: user.userID,
            emailId: user.emailID,
            phoneNumber: newNumber
        }
        if(user.name)userDisplayDetails.name = request_body.name;
        logWithTime("👤 New User Details:- ");
        console.log(userGeneralDetails);
        // Before Automatic Login Just verify that device threshold has not exceeded
        const isThresholdCrossed = await checkDeviceThreshold(req,res);
        if(isThresholdCrossed){
            return res.status(CREATED).json({
                success: true,
                message: "Congratulations, Your Registration is Done Successfully :- ",
                notice: "This Device is linked to another user so you cannot login on this device",
                userDisplayDetails,
            });
        }
        const device = await createDevice(req,res);
        if(!device){
            logWithTime(`❌ Device creation failed for User for device id: (${req.deviceID}) at the time of Sign Up Request`);
            return throwInternalServerError(res);
        }
        logWithTime(`🟢 Device ID (${req.deviceID}) is linked successfully to User (${user.userID})`);
        // Access Token Generation
        const accessToken = await makeTokenWithPrismaID(req,res);
        if(!accessToken){
            logWithTime(`❌ Access Token generation failed after successful registration for User (${user.userID})!. User registered from device id: (${req.deviceID})`);
            return res.status(INTERNAL_ERROR).json({
                success: false,
                message: "User registered but login (token generation) failed. Please try logging in manually.",
                userDisplayDetails
            });
        }
        const isCookieSet = setAccessTokenCookie(res,accessToken);
        if(!isCookieSet){
            logWithTime(`❌ An Internal Error Occurred in setting access token for user (${user.userID}) at the time of Registration. Request is made from device ID: (${req.deviceID})`);
            return;
        }
        await prisma.user.update({
            where: { userID: user.userID },
            data: {
                jwtTokenIssuedAt: new Date()
            }
        });
        const isUserLoggedIn = await loginTheUser(user,device,res);
        if(!isUserLoggedIn){
            logWithTime(`❌ An Internal Error Occurred in logging in the user (${user.userID}) at the time of Registration. Request is made from device ID: (${req.deviceID})`);
            return;
        }
        // Update data into auth.logs
        await logAuthEvent(req, authLogEvents.LOGIN, null);
        logWithTime(`🟢 User (${user.userID}) is successfully logged in on registration from device id: (${req.deviceID})`);
    /* 3. Return the response back to the User */
        return res.status(CREATED).json({
            success: true,
            message: "Congratulations, Your Registration as well as login is Done Successfully :- ",
            userDisplayDetails,
        })
    }catch(err){
        logWithTime(`❌ Internal Error: Error Occured while creating the User having Phone Number: (${req.body.phoneNumber}) and EmailID: (${req.body.emailID}) from device id: (${req.deviceID})`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

/* Logic to Login the Registered User */
const signIn = async (req,res) => {
    try{
        let user = req.foundUser;
        if(!user){
            const userID =  req?.foundUserID || req?.user?.userID || req?.body?.userID;
            user = await prisma.user.findUnique({
                where:{userID: userID}
            });
            if(!user){
                return throwInvalidResourceError(res,"User");
            }
            req.foundUser = user;
        }
        user = req.foundUser;
        req.user = user;
        // ✅ Now Check if User is Already Logged In
        await checkUserIsNotVerified(req,res);
        const checkDeviceLimit = await checkUserDeviceLimit(req,res);
        if(checkDeviceLimit)return;
        const isThresholdCrossed = await checkDeviceThreshold(req,res);
        if(isThresholdCrossed){
            return res.status(FORBIDDEN).json({
                success: false,
                message: "❌ Device limit reached. A user is already signed in on this device."
            });
        }
        // Check Password is Correct or Not
        let isPasswordValid = await checkPasswordIsValid(req,user);
        if(isPasswordValid){ // Login the User
            const device = await createDevice(req,res);
            if(!device){
                logWithTime(`❌ Device creation failed for User ${user.userID} for device id: ${req.deviceID} at the time of Sign In Request`);
                return throwInternalServerError(res);
            }
            // Sign with JWT Token
            const accessToken = await signInWithToken(req,res);
            if (accessToken === "") {
                logWithTime(`❌ Access token generation failed during login of User with userID: ${user.userID} from device id: ${req.deviceID}`);
                return throwInternalServerError(res);
            }
            const isCookieSet = setAccessTokenCookie(res,accessToken);
            if(!isCookieSet){
                logWithTime(`❌ An Internal Error Occurred in setting refresh token for user ${user.userID} at the time of Login. Request is made from device ID: ${req.deviceID}`);
                return;
            }
            await prisma.user.update({
                where: {userID: user.userID},
                data: {
                    jwtTokenIssuedAt: new Date()
                }
            })
            const isUserLoggedIn = await loginTheUser(user,device,res);
            if(!isUserLoggedIn){
                logWithTime(`❌ An Internal Error Occurred in logging in the user ${user.userID} at the time of login request. Request is made from device ID: ${req.deviceID}`);
                return;
            }
            // Update data into auth.logs
            await logAuthEvent(req, authLogEvents.LOGIN, null);
            logWithTime(`🔐 User with ${user.userID} is Successfully logged in from device id: ${req.deviceID}`);
            const praiseBy = user.name || user.userID;
            return res.status(OK).json({
                success: true,
                message: "Welcome "+praiseBy+", You are successfully logged in",
            })
        }
        else{
            logWithTime(`❌ Incorrect Password provided by User with userID: ${user.userID} for Login Purpose from device id: ${req.deviceID}`);
            return throwInvalidResourceError(res,"Password");
        }
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ Internal Error occurred while logging in the User ${getIdentifiers}`);
        errorMessage(err);
        return throwInternalServerError(res);
    }  
}

const signOut = async (req,res) => {
    try{
        let user = req.user;
        if(!user){
            return throwInvalidResourceError(res,"User");
        }
        const isUserLoggedOut = await logoutUserCompletely(user,res,req,"log out")
        if(!isUserLoggedOut)return;
        // Update data into auth.logs
        await logAuthEvent(req, authLogEvents.LOGOUT, null);    
        if (user.isBlocked) {
            logWithTime(`⚠️ Blocked user ${user.userID} attempted to logout from system by (${req.deviceID}).User is now signed out`);
            return throwBlockedAccountError(res); // ✅ Don't proceed if blocked
        }
        else if(!user.isActive){
            logWithTime(`⚠️ Deactivated user ${user.userID} attempted to logout from system by (${req.deviceID}).User is now signed out`);
        }
        else logWithTime(`🔓 User with (${user.userID}) is Successfully logged out from all devices. User used device having device ID: (${req.deviceID})`);
        const praiseBy = user.name || user.userID;
        return res.status(OK).json({
            success: true,
            message: praiseBy+", You are successfully logged out from all devices",
            userID: user.userID,
        })
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ Internal Error occurred while logging out the User ${getIdentifiers}`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

// Logic to activate user account
const activateUserAccount = async(req,res) => {
    try{
        const user = req.foundUser;
        let isPasswordValid = await checkPasswordIsValid(req,user);
        if(!isPasswordValid){
            return throwInvalidResourceError(res,"Password");
        }
        await prisma.user.update({
            where: {userID: user.userID},
            data: {
                isActive: true,
                lastActivatedAt: new Date()
            }
        });
        // Activation success log
        logWithTime(`✅ Account activated for UserID: ${user.userID} from device ID: (${req.deviceID})`);
        // Update data into auth.logs
        await logAuthEvent(req, authLogEvents.ACTIVATE, null);
        return res.status(OK).json({
            success: true,
            message: "Account activated successfully.",
            suggestion: "Please login to continue."
        });
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ Internal Error occurred while activating the User Account ${getIdentifiers}`);
        errorMessage(err)
        return throwInternalServerError(res);
    }
}

// Logic to deactivate user account
const deactivateUserAccount = async(req,res) => {
    try{
        const user = req.user;
        let isPasswordValid = await checkPasswordIsValid(req,user);
        if(!isPasswordValid){
            return throwInvalidResourceError(res,"Password");
        }
        await prisma.user.update({
            where: {userID: user.userID},
            data: {
                isActive: false,
                lastDeactivatedAt: new Date()
            }
        });
        // Forcibly Log Out User when its Account is Deactivated
        const isUserLoggedOut = await logoutUserCompletely(user,res,req,"decativate account request")
        if(!isUserLoggedOut)return;
        // Deactivation success log
        logWithTime(`🚫 Account deactivated for UserID: ${user.userID} from device id: (${req.deviceID})`);
        // Update data into auth.logs
        await logAuthEvent(req, authLogEvents.DEACTIVATE, null);
        return res.status(OK).json({
            success: true,
            message: "Account deactivated successfully.",
            notice: "You are logged out"
        });
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ Internal Error occurred while deactivating the User Account ${getIdentifiers}`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const changePassword = async(req,res) => {
    try{
        const user = req.user;
        const password = req.body.newPassword;
        let isPasswordValid = await checkPasswordIsValid(req,user);
        if(!isPasswordValid){
            return throwInvalidResourceError(res,"Password");
        }
        user.password = await bcryptjs.hash(password, SALT); // Password is Encrypted
        await prisma.user.update({
            where: {userID: user.userID},
            data: {
                password: user.password,
                passwordChangedAt: new Date()
            }
        });
        const isUserLoggedOut = await logoutUserCompletely(user,res,req,"log out from all device request");
        if(!isUserLoggedOut)return;
        logWithTime(`✅ User Password with userID: (${user.userID}) is changed Succesfully from device id: (${req.deviceID})`);
        // Update data into auth.logs
        await logAuthEvent(req, authLogEvents.CHANGE_PASSWORD, null);  
        return res.status(OK).json({
            success: true,
            message: "Your password has been changed successfully."
        });
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ Internal Error occurred while changing the password of User ${getIdentifiers}`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const getMyActiveDevices = async (req, res) => {
  try {
    const user = req.user;

    if (!user.device) {
      logWithTime(`📭 No active devices found for User (${user.userID})`);
      return res.status(OK).json({
        success: true,
        message: "No active devices found.",
        total: 0
      });
    }

    const device = {
        deviceName: user.device.deviceName,
        deviceType: user.device.deviceType,
        lastUsedAt: user.device.lastUsedAt
    }

    // Update data into auth.logs
    await logAuthEvent(req, authLogEvents.GET_MY_ACTIVE_DEVICES, null);

    logWithTime(`🙋‍♂️ User (${user.userID}) fetched public view of their active devices.`);
    return res.status(OK).json({
      success: true,
      message: "You are logged in on this Device.",
      total: 1,
      device: device
    });
  } catch (err) {
    const getIdentifiers = getLogIdentifiers(req);
    logWithTime(`❌ An Internal Error Occurred while fetching the User Active Device Sessions ${getIdentifiers}`);
    errorMessage(err);
    return throwInternalServerError(res);
  }
};

const provideUserAccountDetails = async(req,res) => {
    try{
        const user = req.user; 
        if(!user){
            return throwResourceNotFoundError(res,"User");
        }
        const User_Account_Details = {
            "Name": user.name,
            "Customer ID": user.userID,
            "Phone Number": user.fullPhoneNumber,
            "Email ID": user.emailID,
            "Verified": user.isVerified,
            "Last Login Time": user.lastLogin,
            "Account Status": user.isActive ? "Activated" : "Deactivated",
            "Blocked Account": user.isBlocked ? "Yes" : "No",
            "Account Created At": user.createdAt
        }
        if(user.passwordChangedAt)User_Account_Details["Password Changed At"] = user.passwordChangedAt;
        if(user.lastActivatedAt)User_Account_Details["Activated Account At"] = user.lastActivatedAt;
        if(user.lastDeactivatedAt)User_Account_Details["Deactivated Account At"] = user.lastDeactivatedAt;
        if(user.lastLogout)User_Account_Details["Last Logout At"] = user.lastLogout;
        // Update data into auth.logs
        await logAuthEvent(req, authLogEvents.PROVIDE_MY_ACCOUNT_DETAILS, null);
        logWithTime(`✅ User Account Details with User ID: (${user.userID}) is provided Successfully to User from device ID: (${req.deviceID})`);
        return res.status(OK).json({
            success: true,
            message: "Here is User Account Details",
            User_Account_Details
        });
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while fetching the User Profile ${getIdentifiers}`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

module.exports = {
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    changePassword: changePassword,
    getMyActiveDevices: getMyActiveDevices,
    activateUserAccount: activateUserAccount,
    logoutUserCompletely: logoutUserCompletely,
    deactivateUserAccount: deactivateUserAccount,
    checkUserIsNotVerified: checkUserIsNotVerified,
    provideUserAccountDetails: provideUserAccountDetails
}