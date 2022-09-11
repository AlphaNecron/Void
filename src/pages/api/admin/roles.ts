import {hasPermission, highest, isAdmin, Permission} from 'lib/permission';
import prisma from 'lib/prisma';
import {roleSchema} from 'lib/validate';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';
import {ValidationError} from 'yup';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!(user && isAdmin(user.role.permissions))) return res.unauthorized();
  const highestPerm = highest(user.role.permissions);
  const perms = Object.values(Permission).filter(y => typeof y === 'number') as Permission[];
  switch (req.method) {
  case 'GET': {
    const roles = await prisma.role.findMany({
      orderBy:
          {
            permissions: 'desc'
          },
      include: {
        users: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
    return res.json({
      availablePerms: perms.filter(p => p < highestPerm),
      roles: roles.map(x => ({
        ...x,
        permissions: perms.filter(p => hasPermission(x.permissions, p, false))
      }))
    });
  }
  case 'POST': {
    try {
      const data = await roleSchema.validate(req.body, {
        stripUnknown: true
      });
      const existing = await prisma.role.findFirst({
        where: {
          name: data.name
        }
      });
      if (existing)
        return res.forbid('Role name already exists.');
      const dHighest = highest(data.permissions);
      const cHighest = highest(user.role.permissions);
      if (dHighest >= cHighest)
        return res.forbid('Specified permissions exceeded maximum allowed.');
      await prisma.role.create({
        data
      });
      return res.success();
    } catch (e) {
      if (e instanceof ValidationError)
        return res.error(e.errors.shift());
      return res.error(e.toString());
    }
  }
  case 'PATCH': {
    const {id, ...data} = req.body;
    if (!(id && data)) return res.forbid('No role ID.');
    try {
      const roleData = await roleSchema.validate(data, {
        stripUnknown: true
      });
      const cHighest = highest(user.role.permissions);
      const dHighest = highest(data.permissions);
      const target = await prisma.role.findUnique({
        where: {
          id
        }
      });
      const tHighest = highest(target.permissions);
      if (tHighest >= cHighest)
        return res.forbid('You are not allowed to modify this role.');
      if (dHighest >= cHighest)
        return res.forbid('Specified permissions exceeded maximum allowed.');
      if (data.name && data.name !== target.name) {
        const existing = await prisma.role.findFirst({
          where: {
            name: data.name
          },
          select: {
            id: true
          }
        });
        if (existing && existing.id !== id)
          return res.forbid('Role name already exists.');
      }
      await prisma.role.update({
        where: {
          id
        },
        data: roleData
      });
      return res.success();
    } catch (e) {
      if (e instanceof ValidationError)
        return res.error(e.errors.shift());
      return res.error(e.toString());
    }
  }
  case 'DELETE': {
    const {id} = req.body;
    if (!id) return res.error('No role ID.');
    const target = await prisma.role.findUnique({
      where: {
        id
      },
      select: {
        _count: {
          select: {
            users: true
          }
        },
        permissions: true
      }
    });
    const cHighest = highest(user.role.permissions);
    const tHighest = highest(target.permissions);
    if (tHighest >= cHighest)
      return res.forbid('You are not allowed to modify this role.');
    if (target._count.users > 0) return res.forbid('You are not allowed to delete this non-empty role.');
    await prisma.role.delete({
      where: {
        id
      }
    });
    return res.success();
  }
  default:
    return res.notAllowed();
  }
}

export default withVoid(handler);
