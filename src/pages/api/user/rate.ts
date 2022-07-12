import {VoidRequest, VoidResponse, withVoid} from 'lib/middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const { 'x-ratelimit-limit': limit, 'x-ratelimit-remaining': remaining, 'x-ratelimit-reset': nextReset } = res.getHeaders();
  return res.json({
    limit,
    used: Number(limit) - Number(remaining),
    remaining,
    nextReset
  });
}

export default withVoid(handler);
