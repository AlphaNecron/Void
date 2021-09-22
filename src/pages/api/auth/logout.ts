import { info } from 'lib/logger';
import { NextApiReq, NextApiRes, withDraconic } from 'middleware/withDraconic';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  req.cleanCookie('user');
  info('USER', `User ${user.username} (${user.id}) logged out`);
  return res.json({ success: true });
}

export default withDraconic(handler);