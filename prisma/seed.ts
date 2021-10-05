import { PrismaClient } from '@prisma/client';
import { hashPassword, generateToken } from '../src/lib/utils';
import { info } from '../src/lib/logger';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  if (count === 0) {
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        password: await hashPassword('voiduser'),
        token: generateToken(),
        isAdmin: true
      }
    });
    info('SEED', `Created default user with username "${user.username}" and password "voiduser"`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });