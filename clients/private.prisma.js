const { PrismaClient: PrivatePrismaClient } = require('../../node_modules/.prisma/private');
const privatePrisma = new PrivatePrismaClient();
module.exports = privatePrisma;
