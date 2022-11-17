import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';
import internal from 'void/internal';
import { Permission } from 'lib/permission';
import { throwAndExit } from 'void/utils';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  const pwd = process.env.DEFAULT_PASSWORD || 'voiduser';
  if (count === 0) {
    const owner = await prisma.user.create({
      data: {
        username: process.env.DEFAULT_USERNAME || 'void',
        password: await hash(pwd),
        role: {
          create: {
            name: 'Owner',
            color: '#E96565',
            permissions: Permission.OWNER
          }
        }
      }
    });
    await prisma.role.create({
      data: {
        name: 'User'
      }
    });
    internal.logger.info(`Created default user with username "${owner.username}" and password "${pwd}".`);
  }
}

main()
  .catch(e => {
    throwAndExit(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
