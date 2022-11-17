import { highest, isAdmin } from 'lib/permission';
import { VoidRequest, VoidResponse, withVoid } from 'middleware/withVoid';
import internal from 'void/internal';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!(user && isAdmin(user.role.permissions))) return res.unauthorized();
  switch (req.method) {
  case 'GET': {
    const {id} = req.query;
    const roles = await internal.prisma.role.findMany({
      select: {
        id: true,
        permissions: true,
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            role: {
              select: {
                color: true
              }
            }
          }
        }
      }
    });
    const users = roles.filter(role => highest(role.permissions) < highest(user.role.permissions) && role.id !== id).map(r => r.users).flatMap(users => users);
    return res.json(users);
  }
  case 'PATCH': {
    const {id, users} = req.body;
    if (!(id || users || !Array.isArray(users))) return res.error('No ID.');
    const target = await internal.prisma.role.findUnique({
      where: {
        id
      },
      select: {
        name: true,
        permissions: true
      }
    });
    if (!target) return res.notFound('Role not found.');
    if (highest(target.permissions) > highest(user.role.permissions))
      return res.forbid('You are not allowed to modify this user.');
    await internal.prisma.user.updateMany({
      where: {
        id: {
          in: users
        }
      },
      data: {
        roleName: target.name
      }
    });
    return res.success();
  }
  default:
    return res.notAllowed();
  }
}

export default withVoid(handler);
