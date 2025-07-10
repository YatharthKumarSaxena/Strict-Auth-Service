const { makeTokenWithPrismaID } = require("../utils/issue-token.utils");
const { logWithTime } = require("../utils/time-stamps.utils");

exports.signInWithToken = async (req, res) => {
    const verifyWith = req.verifyWith;
    logWithTime(`User logged in using ${verifyWith}`);
    const token = await makeTokenWithPrismaID(req, res);
    return token || "";
}
