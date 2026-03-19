const { PrismaClient } = require('@prisma/client');

// Instancia o cliente Prisma
const prisma = new PrismaClient();

// Exporta a instância para ser usada em toda a aplicação
module.exports = prisma;
