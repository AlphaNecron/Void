import {format} from 'fecha';
import {isAdmin} from 'lib/permission';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!(user && user.role && isAdmin(user.role.permissions))) return res.unauthorized();
  return res.json([]); // temporary disabled
  /*return res.json(await queryLog().then(l => l?.file.map(l => ({
    ...l,
    timestamp: format(new Date(l.timestamp), 'DD/MM/YYYY - HH:mm:ss')
  }))));*/
}

export default withVoid(handler);
