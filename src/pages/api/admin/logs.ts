import logger from 'lib/logger';
import {isAdmin} from 'lib/permission';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!(user && user.role && isAdmin(user.role.permissions))) return res.unauthorized();
  const entries = logger.query();
  return res.json(entries);
}

export default withVoid(handler);
