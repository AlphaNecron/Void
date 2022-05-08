import {queryLog} from 'lib/logger';
import {isAdmin} from 'lib/permission';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!(user && user.role && isAdmin(user.role.permissions))) return res.unauthorized();
  return res.json(await queryLog().then(l => l?.file));
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default withVoid(handler);
