// controllers/internal-api.controllers.js

const { logWithTime } = require("../utils/time-stamps.utils");
const { setAccessTokenCookie } = require("../utils/cookie-manager.utils");
const { throwInternalServerError, errorMessage, throwResourceNotFoundError, getLogIdentifiers } =  require("../configs/error-handler.configs");
const { logAuthEvent } = require("../utils/auth-log-utils");
const { OK } = require("../configs/http-status.config");
const { createFullPhoneNumber,  checkAndAbortIfUserExists } = require("../utils/auth.utils");
const prisma = require("../clients/public.prisma");
const authLogEvents = require("../configs/auth-log-events.config");
const { isValidCountryCode, isValidNumber, isValidEmail, isValidName } = require("../utils/user-validators.utils");

const updateUserProfile = async (req, res) => {
  try {
    let updatedFields = [];
    const user = req.user;

    // ✅ Name Update
    if (req.body.name && req.body.name !== user.name) {
      const name = req.body.name.trim();
      const isNameValid = isValidName(name, res);
      if (!isNameValid) return;
      updatedFields.push("Name");
      await prisma.user.update({
        where: { userID: user.userID },
        data: { name },
      });
    }

    // ✅ Email ID Update
    if (req.body.emailID && req.body.emailID.trim().toLowerCase() !== user.emailID.trim().toLowerCase()) {
      const emailID = req.body.emailID.trim().toLowerCase();
      const isEmailIDValid = isValidEmail(emailID, res);
      if (!isEmailIDValid) return;

      const userExist = await checkAndAbortIfUserExists(emailID, "000", res);
      if (userExist) return;

      updatedFields.push("Email ID");
      await prisma.user.update({
        where: { userID: user.userID },
        data: { emailID },
      });
    }

    // ✅ Phone Number Update
    const phoneNumber = req.body.phoneNumber;
    if (
      phoneNumber &&
      (
        !user.phoneNumber ||
        phoneNumber.countryCode !== user.phoneNumber.countryCode ||
        phoneNumber.number !== user.phoneNumber.number
      )
    ) {
      let { countryCode, number } = phoneNumber;

      // 🔐 Country Code Update
      if (countryCode && (!user.phoneNumber || countryCode.trim() !== user.phoneNumber.countryCode)) {
        countryCode = countryCode.trim();
        const isCountryCodeValid = isValidCountryCode(countryCode, res);
        if (!isCountryCodeValid) return;
        updatedFields.push("Country Code in Phone Number");
        await prisma.phoneNumber.update({
          where: { userID: user.userID },
          data: { countryCode },
        });
      }

      // 🔐 Number Update
      if (number && (!user.phoneNumber || number.trim() !== user.phoneNumber.number)) {
        number = number.trim();
        const isNumberValid = isValidNumber(number, res);
        if (!isNumberValid) return;
        updatedFields.push("Number in Phone Number");
        await prisma.phoneNumber.update({
          where: { userID: user.userID },
          data: { number },
        });
      }

      // 🔁 Full Phone Number Update
      if (countryCode || number) {
        if (!number) number = user.phoneNumber?.number;
        if (!countryCode) countryCode = user.phoneNumber?.countryCode;

        const newNumber = createFullPhoneNumber(req, res);
        if (!newNumber) return;

        const userExist = await checkAndAbortIfUserExists("www", newNumber, res);
        if (userExist) return;

        await prisma.user.update({
          where: { userID: user.userID },
          data: { fullPhoneNumber: newNumber },
        });
      }
    }

    // 🧾 No Changes Detected
    if (updatedFields.length === 0) {
      logWithTime(`❌ User Account Details with User ID: (${user.userID}) is not modified from device ID: (${req.deviceID}) in Updation Request`);
      return res.status(OK).json({
        message: "No changes detected. Your profile remains the same.",
      });
    }

    // 📘 Logging
    await logAuthEvent(req, authLogEvents.UPDATE_ACCOUNT_DETAILS, null);
    logWithTime(`✅ User (${user.userID}) updated fields: [${updatedFields.join(", ")}] from device: (${req.deviceID})`);
    return res.status(OK).json({
      success: true,
      message: "Profile updated successfully.",
      updatedFields,
    });

  } catch (err) {
    const getIdentifiers = getLogIdentifiers(req);
    logWithTime(`❌ An Internal Error Occurred while updating the User Profile ${getIdentifiers}`);
    errorMessage(err);
    return throwInternalServerError(res);
  }
};


const setAccessTokenInCookieForAdmin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const user = req.user;
    if (!accessToken) {
      return throwResourceNotFoundError(res,"Access Token");
    }

    const isCookieSet = setAccessTokenCookie(res, accessToken);
    if(!isCookieSet){
      logWithTime(`❌ An Internal Error Occurred in setting Access token for user (${user.userID}) at the time of set up admin cookie internal api. Request is made from device ID: (${req.deviceID})`);
      return;
    }

    // Update data into auth.logs
    await logAuthEvent(req, authLogEvents.SET_ACCESS_TOKEN_FOR_ADMIN, null);

    return res.status(OK).json({
      success: true,
      message: "✅ Admin access token set in cookie successfully."
    });
  } catch (err) {
    logWithTime("💥 Error while setting admin access token cookie");
    errorMessage(err);
    return throwInternalServerError(res);
  }
};

// 📦 Controller to Get Total Registered Users (Admins + Customers)
const getTotalRegisteredUsers = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAdmins = await prisma.user.count({where:{ userType: "ADMIN" }});
    const totalCustomers = totalUsers - totalAdmins;

    logWithTime(`📊 Total Users: ${totalUsers}, Admins: ${totalAdmins}, Customers: ${totalCustomers}`);
        
    // Update data into auth.logs
    await logAuthEvent(req, authLogEvents.GET_TOTAL_REGISTERED_USERS , null);

    return res.status(OK).json({
      success: true,
      message: "Total registered users fetched successfully.",
      totalUsers: totalUsers,
      totalAdmins: totalAdmins,
      totalCustomers: totalCustomers
    });

  } catch (err) {
    const getIdentifiers = getLogIdentifiers(req);
    logWithTime(`❌ An Internal Error Occurred while fetching the Total Registered Users ${getIdentifiers}`);
    errorMessage(err);
    return throwInternalServerError(res);
  }
};

module.exports = {
    updateUserProfile: updateUserProfile,
    getTotalRegisteredUsers: getTotalRegisteredUsers,
    setAccessTokenInCookieForAdmin: setAccessTokenInCookieForAdmin
}