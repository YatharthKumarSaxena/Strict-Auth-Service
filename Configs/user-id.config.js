const bcryptjs = require("bcryptjs");
const adminPrefixes = require("./id-prefixes.config").adminIDPrefix;
const IP_Address_Code = require("./ip-address.config").IP_Address_Code;
const adminUserID = Number(process.env.ADMIN_USER_ID);
const adminID = adminPrefixes + IP_Address_Code + String(adminUserID);
const SALT = Number(process.env.SALT);
module.exports = {
    userRegistrationCapacity: Number(process.env.USER_REGISTRATION_CAPACITY),
    adminUserID:adminUserID,
    adminID: adminID, // Admin userID
    IP_Address_Code: IP_Address_Code, // Unique per machine
    SALT: SALT,
    secretCodeOfAccessToken: process.env.ACCESS_TOKEN_SECRET_CODE,
    expiryTimeOfAccessToken: Number(process.env.ACCESS_TOKEN_EXPIRY),
    adminUser:{
        name: process.env.ADMIN_NAME,
        phoneNumber: {
            countryCode: process.env.ADMIN_COUNTRY_CODE,
            number: process.env.ADMIN_NUMBER
        },
        fullPhoneNumber: process.env.ADMIN_FULL_PHONE_NUMBER,
        // Password is Encypted to make the Password more complicated to crack
        // When Someone by Chance get access to Database if password is stored in Encrypted format
        // It makes it complicated to decode and hence it increases the security of User Data Privacy
        // There are so many methods for Hashing , in this project I used SALT Based Hashing
        // SALT is bascially a Random Text (Can be String or Number) is added to password
        password: process.env.ADMIN_PASSWORD,
        emailID: process.env.ADMIN_EMAIL_ID,
        userType: "ADMIN",
        userID: adminID,
        devices: {
            info: []
        }
    }
}