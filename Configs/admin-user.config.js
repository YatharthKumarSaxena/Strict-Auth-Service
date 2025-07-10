const { adminID } = require("./admin-id.config");

module.exports = {
    adminUser: {
        name: process.env.ADMIN_NAME,
        phoneNumber: {
            countryCode: process.env.ADMIN_COUNTRY_CODE,
            number: process.env.ADMIN_NUMBER
        },
        fullPhoneNumber: process.env.ADMIN_FULL_PHONE_NUMBER,
        password: process.env.ADMIN_PASSWORD, // will be hashed on first use
        emailID: process.env.ADMIN_EMAIL_ID,
        userType: "ADMIN",
        userID: adminID
    }
};
