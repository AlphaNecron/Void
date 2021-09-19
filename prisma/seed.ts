import { PrismaClient } from '@prisma/client';
import { hashPassword, createToken } from '../src/lib/utils';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      username: 'admin',
      password: await hashPassword('draconicuser'),
      token: createToken(),
      isAdmin: true
    }
  });
  console.log(`
Use these credentials when logging in Draconic for the first time:
Username: ${user.username}
Password: draconicuser
`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });