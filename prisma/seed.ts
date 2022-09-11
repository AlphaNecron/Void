import {PrismaClient} from '@prisma/client';
import {hash} from 'argon2';
import logger from 'lib/logger';
import {maxed} from 'lib/permission';
import {throwAndExit} from 'lib/serverUtils';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  if (count === 0) {
    const owner = await prisma.user.create({
      data: {
        username: 'void',
        password: await hash('voiduser'),
        role: {
          create: {
            name: 'Owner',
            color: '#E96565',
            permissions: maxed(),
          }
        }
      }
    });
    await prisma.role.create({
      data: {
        name: 'User'
      }
    });
    logger.info(`Created default user with username "${owner.username}" and password "voiduser".`);
  }
}

main()
  .catch(e => {
    throwAndExit(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
