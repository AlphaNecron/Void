import {PrismaClient} from '@prisma/client';
import {hash} from 'argon2';
import {fallback} from '../src/lib/logger';
import {Permission} from '../src/lib/permission';

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.create({
    data: {
      username: 'void',
      password: await hash('voiduser'),
      role: {
        create: {
          name: 'Owner',
          rolePriority: 0,
          permissions: Permission.OWNER,
        }
      }
    }
  });
  await prisma.role.create({
    data: {
      name: 'User'
    }
  });
  fallback.info(`Created default user with username "${owner.username}" and password "voiduser".`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
