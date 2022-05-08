import {isAdmin} from 'lib/permission';
import prisma from 'lib/prisma';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!(user && user.role && isAdmin(user.role.permissions))) return res.unauthorized();
  if (req.method === 'GET') {
    const roles = await prisma.role.findMany();
    return res.json(roles.map(x => ({ ...x, maxFileSize: Number(x.maxFileSize), storageQuota: Number(x.storageQuota) })));
  } else return res.notAllowed();
}

export default withVoid(handler);
