module.exports = {
    SALT: Number(process.env.SALT),
    secretCodeOfAccessToken: process.env.ACCESS_TOKEN_SECRET_CODE,
    expiryTimeOfAccessToken: Number(process.env.ACCESS_TOKEN_EXPIRY)
};
