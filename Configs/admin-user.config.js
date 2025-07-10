const { adminID } = require("./admin-id.config");
const bcryptjs = require("bcrypt");
const { SALT } = require("./security.config");

module.exports = async function getAdminUserObject() {
    return {
        name: process.env.ADMIN_NAME,
        phoneNumber: {
            countryCode: process.env.ADMIN_COUNTRY_CODE,
            number: process.env.ADMIN_NUMBER
        },
        fullPhoneNumber: process.env.ADMIN_FULL_PHONE_NUMBER,
        password: await bcryptjs.hash(process.env.ADMIN_PASSWORD, SALT),
        emailID: process.env.ADMIN_EMAIL_ID,
        userType: "ADMIN",
        userID: adminID
    };
};
