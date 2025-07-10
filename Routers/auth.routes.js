// ========== 🔐 AUTHENTICATION ROUTES ==========

const express = require("express");
const router = express.Router();
const URIS = require("../configs/uri.config");
const authController = require("../controllers/auth.controllers");
const authMiddleware = require("../middlewares/auth.middleware");
const commonUsedMiddleware = require("../middlewares/common-used.middleware");
const specialLimiter = require("../rate-limiters/special-api-rate-limiter");
const generalLimiter = require("../rate-limiters/general-api.rate-limiter");

// 🔹 Middleware: Body Parser - THIS MUST BE BEFORE ROUTES
const bodyParser = express.json();  // Converts the JSON Object Requests into JavaScript Object

const {
  SIGNUP, SIGNIN, SIGNOUT,
  ACTIVATE_USER, DEACTIVATE_USER, CHANGE_PASSWORD, CHECK_ACTIVE_SESSIONS
} = URIS.AUTH_ROUTES;

// 👤 Public User Signup Route
// 🔒 Middleware:
// - Check whether Device provided or not
// - Check that device is blocked or not
// - Rate Limiter to prevent Server Crash from Heavy API Attacks
// - Validates required fields for creating a new user
// 📌 Controller:
// - Creates and stores user in DB
router.post(SIGNUP, [
  bodyParser,
  commonUsedMiddleware.verifyDeviceField,
  commonUsedMiddleware.checkDeviceIsNotBlocked,
  specialLimiter.signUpRateLimiter,
  authMiddleware.verifySignUpBody
], authController.signUp);

// 🔐 Public User Signin Route
// 🔒 Middleware:
// - Check whether Device provided or not
// - Check that device is blocked or not
// - Rate Limiter to prevent Server Crash from Heavy API Attacks
// - Verifies login credentials
// - Checks if user is blocked or deactivated
// - Checks User Account is acive
// 📌 Controller:
// - Logs user in and returns access token
router.post(SIGNIN, [
  bodyParser,
  commonUsedMiddleware.verifyDeviceField,
  commonUsedMiddleware.checkDeviceIsNotBlocked,
  specialLimiter.signInRateLimiter,
  authMiddleware.verifySignInBody,
  commonUsedMiddleware.isUserBlocked,
  commonUsedMiddleware.isUserAccountActive,
], authController.signIn);

// 🔓 Public User Forced Signout Route: Sign Out User From All Devices
// 🔒 Middleware:
// - Check whether Device provided or not
// - Check that device is blocked or not
// - Validates Access token or generate it if Expired
// - Rate Limiter to prevent Server Crash from Heavy API Attacks
// - Validates signout body
// 📌 Controller:
// - Logs user out by invalidating session/token
router.post(SIGNOUT, [
  bodyParser,
  commonUsedMiddleware.verifyDeviceField,
  commonUsedMiddleware.checkDeviceIsNotBlocked,
  commonUsedMiddleware.verifyToken,
  generalLimiter.signOutRateLimiter,
  authMiddleware.verifySignOutBody
], authController.signOut);

// ✅ Public User: Activate Own Account
// 🔒 Middleware:
// - Check whether Device provided or not
// - Check that device is blocked or not
// - Rate Limiter to prevent Server Crash from Heavy API Attacks
// - Ensures user is not blocked
// - Verifies required credentials in body
// 📌 Controller:
// - Activates inactive user account
router.patch(ACTIVATE_USER, [
  bodyParser,
  commonUsedMiddleware.verifyDeviceField,
  commonUsedMiddleware.checkDeviceIsNotBlocked,
  specialLimiter.activateAccountRateLimiter,
  authMiddleware.verifyActivateUserAccountBody,
  commonUsedMiddleware.isUserBlocked
], authController.activateUserAccount);

// 🚫 Public User: Deactivate Own Account
// 🔒 Middleware:
// - Check whether Device provided or not
// - Check that device is blocked or not
// - Validates Access token or generate it if Expired
// - Rate Limiter to prevent Server Crash from Heavy API Attacks
// - Confirms user is not blocked
// - Confirms user is active
// - Validates input body with password + identification
// 📌 Controller:
// - Deactivates account and logs user out
router.patch(DEACTIVATE_USER, [
  bodyParser,
  commonUsedMiddleware.verifyDeviceField,
  commonUsedMiddleware.checkDeviceIsNotBlocked,
  commonUsedMiddleware.verifyToken,
  generalLimiter.deactivateAccountRateLimiter,
  authMiddleware.verifyDeactivateUserAccountBody,
  commonUsedMiddleware.isUserBlocked,
  commonUsedMiddleware.isUserAccountActive,
  commonUsedMiddleware.checkUserIsVerified
], authController.deactivateUserAccount);

// 👤 Authenticated User: Change their own Password
// 🔒 Middleware:
// - Check whether Device provided or not
// - Check that device is blocked or not
// - Validates Access token or generate it if Expired
// - Rate Limiter to prevent Server Crash from Heavy API Attacks
// - Confirms user is not blocked (e.g. by admin)
// - Confirms user's account is active (not deactivated/suspended)
// - Confirms user is Logged in on that device
// - Checks provided request body is valid 
// 🛠️ Controller:
// - Updates the Password of User if it satisfies some constraints
// - Responds with either a success message + no changes made
router.patch(CHANGE_PASSWORD, [
  bodyParser,
  commonUsedMiddleware.verifyDeviceField,
  commonUsedMiddleware.checkDeviceIsNotBlocked,
  commonUsedMiddleware.verifyToken,
  generalLimiter.changePasswordRateLimiter,
  authMiddleware.verifyChangePasswordBody,
  commonUsedMiddleware.isUserBlocked,
  commonUsedMiddleware.isUserAccountActive,
  commonUsedMiddleware.checkUserIsVerified
], authController.changePassword);

// 👤 Authenticated User: Provide details of devices to user where he/she is logged in
// 🔒 Middleware:
// - Check whether Device provided or not
// - Check that device is blocked or not
// - Validates Access token or generate it if Expired
// - Rate Limiter to prevent Server Crash from Heavy API Attacks
// - Confirms user is not blocked (e.g. by admin)
// - Confirms user's account is active (not deactivated/suspended)
// - Confirms user is Logged in on that device
// 🛠️ Controller:
// - Provide the user list of active sessions
router.get(CHECK_ACTIVE_SESSIONS, [
  commonUsedMiddleware.verifyDeviceField,
  commonUsedMiddleware.checkDeviceIsNotBlocked,
  commonUsedMiddleware.verifyToken,
  generalLimiter.getActiveDevicesRateLimiter,
  commonUsedMiddleware.isUserBlocked,
  commonUsedMiddleware.isUserAccountActive,
  commonUsedMiddleware.checkUserIsVerified
], authController.getMyActiveDevices);

module.exports = router;
