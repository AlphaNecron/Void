import {VoidRequest, VoidResponse, withVoid} from 'lib/middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  return res.json({});
}

export default withVoid(handler);
