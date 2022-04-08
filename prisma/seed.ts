import { PrismaClient } from '@prisma/client';
import { info } from '../src/lib/logger';
import { hash } from 'argon2';
import { Permission } from '../src/lib/permission';

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const roleCount = await prisma.role.count();
  if (roleCount === 0 && userCount === 0) {
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
    info('SEED', `Created default user with username "${owner.username}" and password "voiduser"`);
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