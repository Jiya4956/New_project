require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

async function test() {
  try {
    const count = await prisma.user.count();
    console.log('Users:', count);
    console.log('✅ Connection OK!');
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}
test();
