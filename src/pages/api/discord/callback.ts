import oauth from 'lib/oauth';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  if (oauth) {
    const { code, state } = req.query;
    if (!(code && state)) return res.error('Malformed query.');
    return res.success();
  }
  return res.forbid('Discord OAuth is not enabled.');
}

export default withVoid(handler);
