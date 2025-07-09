const { httpOnly, secure, sameSite } = require("../configs/cookies.config");
const { errorMessage, throwInternalServerError } = require("../configs/error-handler.configs");
const { expiryTimeOfAccessToken } = require("../configs/token-expiry.config");
const { logWithTime } = require("./time-stamps.utils");

// utils/cookie-manager.utils.js

const setAccessTokenCookie = (res, token) => {
    try{
        res.cookie("accessToken", token, {
            httpOnly: httpOnly,
            sameSite: sameSite,
            secure: secure,
            maxAge: expiryTimeOfAccessToken
        });
        logWithTime(`🍪 Access Token Cookie Set`);
        return true;
    }catch(err){
        logWithTime("An Internal Error occured while setting the Access Token in Cookie");
        errorMessage(err);
        throwInternalServerError(res);
        return false;
    }
};

const clearAccessTokenCookie = (res) => {
    try{
        res.clearCookie("accessToken", {
            httpOnly: httpOnly,
            sameSite: sameSite,
            secure: secure,
            maxAge: expiryTimeOfAccessToken
        });
        logWithTime(`🧹 Access Token Cookie Cleared`);
        return true;
    }catch(err){
        logWithTime("An Internal Error occured while clearing the Access Token from Cookie");
        errorMessage(err);
        throwInternalServerError(res);
        return false;
    }
};

module.exports = {
    setAccessTokenCookie: setAccessTokenCookie,
    clearAccessTokenCookie: clearAccessTokenCookie
}