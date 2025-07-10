const { adminID } = require("./admin-id.config");
const bcryptjs = require("bcryptjs");
const { SALT } = require("./security.config");
const prisma = require("../clients/public.prisma");
const { logWithTime } = require("../utils/time-stamps.utils");
const { errorMessage } = require("./error-handler.configs");
const authLogEvents = require("./auth-log-events.config");
const { adminAuthLogForSetUp } = require("../utils/auth-log-utils");

async function createAdminUserIfNotExists() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { userType: "ADMIN" },
    });

    if (existingAdmin) {
      logWithTime("🟢 Admin User already exists.");
      return null;
    }

    const newAdmin = {
      name: process.env.ADMIN_NAME,
      fullPhoneNumber: process.env.ADMIN_FULL_PHONE_NUMBER,
      phoneNumber: {
        create: {
            countryCode: process.env.ADMIN_COUNTRY_CODE,
            number: process.env.ADMIN_NUMBER
        }
      },
      password: process.env.ADMIN_PASSWORD,
      emailID: process.env.ADMIN_EMAIL_ID,
      userType: "ADMIN",
      userID: adminID,
    };

    const createdAdmin = await prisma.user.create({ data: newAdmin });

    logWithTime("👑 Admin User Created Successfully");
    logWithTime("Admin User details are given below:-");
    console.log(createdAdmin);

    await adminAuthLogForSetUp(createdAdmin, authLogEvents.REGISTER, null);
    return createdAdmin;

  } catch (err) {
    logWithTime("⚠️ Error Occurred while Initializing Admin User");
    errorMessage(err);
    return null;
  }
}

module.exports = {
    createAdminUserIfNotExists: createAdminUserIfNotExists
}
