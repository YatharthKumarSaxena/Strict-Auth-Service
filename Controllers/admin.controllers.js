// This file will include the controller logic for all powers of Admin

// Extract the Required Modules
const prisma = require('../clients/public.prisma');   // ← user table lives in public DB
const { throwInvalidResourceError, throwInternalServerError, errorMessage, throwAccessDeniedError } = require("../configs/error-handler.configs");
const { logWithTime } = require("../utils/time-stamps.utils");
const { adminID } = require("../configs/admin-id.config");
const { BLOCK_REASONS, UNBLOCK_REASONS } = require("../configs/user-enums.config");
const { fetchUser } = require("../middlewares/helper.middleware");
const { isAdminID, validateSingleIdentifier } = require("../utils/auth.utils");
const { logAuthEvent } = require("../utils/auth-log-utils");
const { OK } = require("../configs/http-status.config");
const { getLogIdentifiers } = require("../configs/error-handler.configs");
const authLogEvents = require("../configs/auth-log-events.config");

const blockUserAccount = async(req,res) => {
    try{
        const blockReason = req.body.reason;
        const verifyWith = await fetchUser(req,res);
        if(verifyWith === ""){
            logWithTime(`⚠️ Invalid block request. Admin (${req.user.userID}) tried blocking non-existent user: ${req.body?.userID || req.body?.phoneNumber || req.body?.emailID} from device ID: (${req.deviceID}) with (${blockReason}) reason`);
            return throwInvalidResourceError(res,"UserID,Phone Number or EmailID (Any one of it)");
        }
        const user = req.foundUser;
        // Check Requested User to be Blocked is Admin 
        if(user.userType === "ADMIN"){
            logWithTime(`🛡️👨‍💼 Admin (${req.user.userID}) cannot be blocked, admin tried to itself block from device id: (${req.deviceID}) . Provided Reason to block: (${blockReason}) `);
            return throwAccessDeniedError(res,"Admin cannot be blocked.");
        }
        // Checking Provided Reasons for Blocking are Invalid
        if (!Object.values(BLOCK_REASONS).includes(blockReason)) {
            logWithTime(`✅ Admin (${req.user.userID}) tried to block user (${req.body.userID }) with invalid reason (${blockReason}) from device id: (${req.deviceID})`);
            return throwInvalidResourceError(res,`Block reason. Accepted reasons: ${Object.values(BLOCK_REASONS).join(", ")}`);
        }
        if(user.isBlocked){
            logWithTime(`⚠️ User (${user.userID}) is already blocked, admin (${req.user.userID}) tried to block it from device ID: (${req.deviceID}) with (${user.blockReason}) reason. Reason provided by admin to block this user at current: (${blockReason})`);
            return throwAccessDeniedError(res,`User (${user.userID}) is already blocked with (${user.blockReason}) reason.`)
        }
        // Block the user by setting isBlocked = true
        await prisma.user.update({
            where: { userID: user.userID },
            data: {
                isBlocked: true,
                blockedAt: new Date(),
                blockedBy: req.user.userID,
                blockedVia: verifyWith,
                blockCount: { increment: 1 },
                blockReason: blockReason
            }
        });
        logWithTime(`✅ Admin (${req.user.userID}) blocked user (${user.userID}) from device ID: (${req.deviceID}) with (${blockReason}) reason via (${verifyWith})`);
        // Update data into auth.logs
        await logAuthEvent(req, authLogEvents.BLOCKED ,{
            performedOn: user,
            adminAction: { reason: blockReason, targetUserID: user.userID }
        });  
        return res.status(OK).json({
            success: true,
            message: `User (${user.userID}) has been successfully blocked.`,
            resolvedBy: verifyWith
        });
    }catch(err){
        logWithTime(`❌ Internal Error: Admin (${req.user.userID}) tried to block User (${req.body.userID || req.body.emailID || req.body.phoneNumber}) from device ID: (${req.deviceID}).Provided Reason to block: (${req.body.reason}) reason`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const unblockUserAccount = async(req,res) => {
    try{
        const unblockReason = req.body.reason;
        const verifyWith = await fetchUser(req,res);
        if(verifyWith === ""){
            logWithTime(`⚠️ Invalid unblock request. Admin (${req.user.userID}) tried blocking non-existent user: ${req.body?.userID || req.body?.phoneNumber || req.body?.emailID} from device ID: (${req.deviceID}) with (${unblockReason}) reason`);
            return throwInvalidResourceError(res,"UserID,Phone Number or EmailID (Any one of it)");
        }
        const user = req.foundUser;
        // Check Requested User to be Unblocked is Admin 
        if(user.userType === "ADMIN"){
            logWithTime(`🛡️👨‍💼 Admin (${req.user.userID}) cannot be unblocked, tried to unblock from device ID: (${req.deviceID}). Provided Reason to unblock: (${unblockReason}) reason`);
            return throwAccessDeniedError(res,"Admin cannot be unblocked.");
        }
        // Checking Provided Reasons for Unblocking are Invalid
        if (!Object.values(UNBLOCK_REASONS).includes(unblockReason)) {
            logWithTime(`✅ Admin (${req.user.userID}) tried to unblock user (${req.body.userID }) with invalid reason (${unblockReason}) from device ID: (${req.deviceID})`);
            return throwInvalidResourceError(res,`Unblock reason. Accepted reasons: ${Object.values(UNBLOCK_REASONS).join(", ")}`);
        }
        if(!user.isBlocked){
            logWithTime(`⚠️ User (${user.userID}) is already unblocked, admin (${req.user.userID}) tried to unblock it from device ID: (${req.deviceID}) with (${unblockReason}) reason`);
            return throwAccessDeniedError(res,`User (${user.userID}) is already unblocked with (${user.unblockReason}) reason.`)
        }
        await prisma.user.update({
            where: { userID: user.userID },
            data: {
                isBlocked: false,
                unblockedAt: new Date(),
                unblockedBy: req.user.userID,
                unblockedVia: verifyWith,
                unblockCount: { increment: 1 },
                unblockReason: unblockReason
            }
        });
        logWithTime(`✅ Admin (${req.user.userID}) unblocked user (${user.userID}) from device ID: (${req.deviceID}) with (${unblockReason}) reason via (${verifyWith})`);
        // Update data into auth.logs
        await logAuthEvent(req, authLogEvents.UNBLOCKED ,{
            performedOn: user,
            adminAction: { reason: unblockReason, targetUserID: user.userID }
        });  
        return res.status(OK).json({
            success: true,
            message: `User (${user.userID}) has been successfully unblocked.`,
            resolvedBy: verifyWith
        });
    }catch(err){
        logWithTime(`❌ Internal Error: Admin (${req.user.userID}) tried to unblock User (${req.body.userID || req.body.emailID || req.body.phoneNumber}) from device ID: (${req.deviceID}). Provided Reason to unblock: (${req.body.reason}) reason`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const getUserAuthLogs = async (req, res) => {
  try {
    const { eventType, startDate, endDate } = req.body;

    let validateBody;
    let verifyWith;
    if(req.body && (req.body.userID || req.body.emailID || req.body.fullPhoneNumber)){
        validateBody = validateSingleIdentifier(req,res);
        if(!validateBody)return;
        verifyWith = await fetchUser(req,res);
    }

    let user;
    if(verifyWith !== ""){
        user = req.foundUser;
    }

    let userID;
    if(user)userID = user.userID;

    if (userID){
        const isUserCheckedAdmin = isAdminID(userID);
        if(isUserCheckedAdmin && userID !== adminID){
            logWithTime(`❌ Admin (${req.user.userID}) attempted to access logs of another admin (${userID})`);
            return throwAccessDeniedError(res,"Access denied. You cannot access another admin's authentication logs.")
        }
        query.userID = userID;
    } 
    
    const prismaQuery = {
      where: {},
      orderBy: {
        timestamp: 'desc'
      }
    };

    if (userID) {
      prismaQuery.where.userID = userID;
    }

    if (eventType && Array.isArray(eventType) && eventType.length > 0) {
      prismaQuery.where.eventType = {
        in: eventType
      };
    }

    if (startDate && endDate) {
      prismaQuery.where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const logs = await prismaPrivate.authLog.findMany(prismaQuery);

    // Update data into auth.logs
    await logAuthEvent(req, authLogEvents.CHECK_AUTH_LOGS , {
        filter: eventType || "ALL"
    });

    return res.status(OK).json({
      success: true,
      message: "User authentication logs fetched successfully.",
      total: logs.length,
      logs: logs
    });

  } catch (err) {
    logWithTime(`❌ Internal Error:  Admin (${req.user.userID}) tried to fetch log of (${req.body.userID}) from device ID: (${req.deviceID})`);
    errorMessage(err);
    return throwInternalServerError(res);
  }
};

// For Admin Panel Service (Internal API Controller)
const checkUserAccountStatus = async(req,res) => {
    try{
        // If Get Request has a User then We have to Extract its Details and give to the Admin
        let user;
        let verifyWith = await fetchUser(req,res);
        if (res.headersSent) return; // If response is returned by fetchUser
        if(verifyWith !== "")user = req.foundUser;
        // This Will Execute if It is Normal Request Made By User to View their Account Details
        if(!user)user = req.user; 
        if(!user){
            return throwResourceNotFoundError(res,"User");
        }
        const isUserCheckedAdmin = isAdminID(user.userID);
        if(isUserCheckedAdmin && user.userID !== adminID){
            logWithTime(`❌ Admin (${req.user.userID}) attempted to access logs of another admin (${user.userID})`);
            return throwAccessDeniedError(res, "Access denied. You cannot access another admin's authentication logs.");
        }
        const User_Account_Details = {
            "Name": user.name,
            "Customer ID": user.userID,
            "Country Code": user.phoneNumber.countryCode,
            "Number": user.phoneNumber.number,
            "Email ID": user.emailID,
            "Verified": user.isVerified,
            "Login Count": user.loginCount,
            "Account Status": user.isActive ? "Activated" : "Deactivated",
            "Blocked Account": user.isBlocked ? "Yes" : "No",
            "Block Count": user.blockCount,
            "Unblock Count": user.unblockCount
        }
        if(user.passwordChangedAt)User_Account_Details["Password Changed At"] = user.passwordChangedAt;
        if(user.lastLogin)User_Account_Details["Last Login Time"] = user.lastLogin;
        if(user.lastActivatedAt)User_Account_Details["Activated Account At"] = user.lastActivatedAt;
        if(user.lastDeactivatedAt)User_Account_Details["Deactivated Account At"] = user.lastDeactivatedAt;
        if(user.lastLogout)User_Account_Details["Last Logout At"] = user.lastLogout;
        if(user.blockedAt){
            User_Account_Details["Blocked At"] = user.blockedAt;
            User_Account_Details["Blocked By"] = user.blockedBy;
            User_Account_Details["Block Reason"] = user.blockReason;
            User_Account_Details["Blocked Via"] = user.blockedVia;
        }
        if(user.unblockedAt){
            User_Account_Details["Unblocked At"] = user.unblockedAt;
            User_Account_Details["Unblocked By"] = user.unblockedBy;
            User_Account_Details["Unblock Reason"] = user.unblockReason;
            User_Account_Details["Unblocked Via"] = user.unblockedVia;
        }

        const reason = req.query.reason;

        // Update data into auth.logs
        await logAuthEvent(req, authLogEvents.PROVIDE_USER_ACCOUNT_DETAILS , {
            performedOn: user,
            adminAction: { reason: reason, targetUserID: user.userID }
        });

        logWithTime(`✅ User Account Details with User ID: (${user.userID}) is provided Successfully to Admin (${req.user.userID}) from device ID: (${req.deviceID}) via (${verifyWith})`);
        return res.status(OK).json({
            success: true,
            message: "Here is User Account Details",
            User_Account_Details,
            resolvedBy: verifyWith
        });
    }catch(err){
        const getIdentifiers = getLogIdentifiers(req);
        logWithTime(`❌ An Internal Error Occurred while fetching the User Profile ${getIdentifiers}`);
        errorMessage(err);
        return throwInternalServerError(res);
    }
}

const getUserActiveDevicesForAdmin = async (req, res) => {
  try {

    // 🚫 Disallow viewing other admins (unless super-admin override)
    const isTargetAdmin = isAdminID(req.foundUser.userID);
    if (isTargetAdmin && req.foundUser.userID !== adminID) {
      logWithTime(`🚫 Admin (${req.user.userID}) tried to access another admin (${req.foundUser.userID}) device sessions.`);
      return throwAccessDeniedError(res, "You cannot access another admin's authentication logs.");
    }

    // ✅ Proceed with extracting devices
    const user = req.foundUser;
    if (!user.device) {
      logWithTime(`📭 No active devices found for User (${user.userID})`);
      return res.status(OK).json({
        success: true,
        message: "No active devices found for this user.",
        total: 0,
        devices: []
      });
    }

    const reason = req.query.reason;

    // 📝 Log event
    await logAuthEvent(req, authLogEvents.GET_USER_ACTIVE_DEVICES , {
      performedOn: user,
      adminAction: { reason: reason, targetUserID: user.userID }
    });

    logWithTime(`👁️ Admin (${req.user.userID}) viewed active device of User (${user.userID})`);

    return res.status(OK).json({
      success: true,
      message: `Fetched active device sessions of User (${user.userID})`,
      total: 1,
      devices: [user.device]
    });

  } catch (err) {
    const getIdentifiers = getLogIdentifiers(req);
    logWithTime(`❌ Internal Error occurred while fetching user's active devices ${getIdentifiers}`);
    errorMessage(err);
    return throwInternalServerError(res);
  }
};

module.exports = {
    getUserAuthLogs: getUserAuthLogs,
    blockUserAccount: blockUserAccount,
    unblockUserAccount: unblockUserAccount,
    checkUserAccountStatus: checkUserAccountStatus,
    getUserActiveDevicesForAdmin: getUserActiveDevicesForAdmin
}