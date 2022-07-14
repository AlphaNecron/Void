import {hasPermission, isAdmin, Permission} from 'lib/permission';
import prisma from 'lib/prisma';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!(user && user.role && isAdmin(user.role.permissions))) return res.unauthorized();
  const perms = Object.values(Permission).filter(y => typeof y === 'string');
  switch (req.method) {
  case 'GET': {
    const roles = await prisma.role.findMany({
      orderBy: [
        {
          permissions: 'desc'
        },
        {
          rolePriority: 'asc'
        }
      ],
      include: {
        users: {
          select: {
            username: true
          }
        }
      }
    });
    return res.json(roles.map(x => ({
      ...x,
      permissionInteger: x.permissions,
      permissions: perms.filter(y => hasPermission(x.permissions, Permission[y], false))
    })));
  }
  case 'POST': {
    return res.success();
  }
  case 'DELETE': {
    return res.success();
  }
  default:
    return res.notAllowed();
  }
}

export default withVoid(handler);
