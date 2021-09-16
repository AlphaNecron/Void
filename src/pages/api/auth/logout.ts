import { NextApiReq, NextApiRes, withAxtral } from 'middleware/withAxtral';
import { info } from 'lib/logger';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  req.cleanCookie('user');
  info('USER', `User ${user.username} (${user.id}) logged out`);
  return res.json({ success: true });
}

export default withAxtral(handler);