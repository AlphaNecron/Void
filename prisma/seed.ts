import { PrismaClient } from '@prisma/client';
import { hashPassword, createToken } from '../src/lib/utils';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      username: 'axtral',
      password: await hashPassword('axtraluser'),
      token: createToken(),
      isAdmin: true
    }
  });
  console.log(`
Use these credentials when logging in Axtral for the first time:
Username: ${user.username}
Password: axtraluser
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