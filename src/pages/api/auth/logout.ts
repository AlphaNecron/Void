import { VoidRequest, VoidResponse, withVoid } from 'lib/middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  await req.session.destroy();
  return res.success();
}

export default withVoid(handler);
