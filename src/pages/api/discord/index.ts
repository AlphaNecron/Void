import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  return res.json({
    ok: true
  });
}

export default withVoid(handler);
