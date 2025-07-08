const { PrismaClient: PublicPrismaClient } = require('../../node_modules/.prisma/public');
const publicPrisma = new PublicPrismaClient();
module.exports = publicPrisma;
