const prismaPrivate = require("../clients/private.prisma");

// Default values — tune them as needed
const REQUEST_LIMIT = 5;
const TIME_WINDOW_MS = 60 * 1000; // 1 minute

exports.getRateLimitMeta = async (deviceID, routeKey) => {
    const record = await prismaPrivate.rateLimit.findUnique({
        where: {
            deviceID_routeKey: { deviceID, routeKey }
        }
    });
    if (record) return record;
    return { requestCount: 0, lastRequestAt: new Date(0) };
};

exports.shouldBlockRequest = (requestCount, lastRequestAt) => {
    const now = Date.now();
    return (
        requestCount >= REQUEST_LIMIT &&
        now - lastRequestAt < TIME_WINDOW_MS
    );
};

exports.incrementRateLimitCount = async (deviceID, routeKey) => {
    const now = new Date();
    await prismaPrivate.rateLimit.upsert({
        where: {
            deviceID_routeKey: { deviceID, routeKey }
        },
        update: {
            requestCount: { increment: 1 },
            lastRequestAt: now
        },
        create: {
            deviceID,
            routeKey,
            requestCount: 1,
            lastRequestAt: now
        }
    });
};
