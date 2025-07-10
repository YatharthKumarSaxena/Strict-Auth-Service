// routers/internal.routes.js

const express = require("express");
const router = express.Router();
const URIS = require("../configs/uri.config");
const { setAccessTokenInCookieForAdmin } = require("../controllers/internal-api.controllers");
const commonUsedMiddleware = require("../middlewares/common-used.middleware");

// 🔹 Middleware: Body Parser - THIS MUST BE BEFORE ROUTES
const bodyParser = express.json();  // Converts the JSON Object Requests into JavaScript Object

const { SET_ACCESS_COOKIE } = URIS.INTERNAL_ROUTES;

// ------- Note:- This API is for Development Phase Only ------------ //

// 🔐 Admin Internal API: Set Refresh Token in Cookie
// - Check whether Device provided or not
// - Check that device is blocked or not
// - Middleware that Verify Request Body that Access token is Present or Not
// - Verify that User is Admin or not
// - Verify that Admin is logged in or not
// - Controller that set Access Token in Cookie 
router.post(SET_ACCESS_COOKIE, [
  bodyParser,
  commonUsedMiddleware.verifyDeviceField,
  commonUsedMiddleware.checkDeviceIsNotBlocked,
  commonUsedMiddleware.verifySetAdminCookieBody,
  commonUsedMiddleware.isAdmin,
  commonUsedMiddleware.checkUserIsVerified
], setAccessTokenInCookieForAdmin);

module.exports = router;
