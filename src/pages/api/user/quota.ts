import { hasPermission, Permission } from 'lib/permission';
import { VoidRequest, VoidResponse, withVoid } from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!user) return res.unauthorized();
  const quota = await req.getUserQuota(user);
  return res.json({noRestriction: hasPermission(user.role.permissions, Permission.BYPASS_LIMIT), ...quota});
}

export default withVoid(handler);
