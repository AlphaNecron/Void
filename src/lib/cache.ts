import {VoidResponse} from 'middleware/withVoid';
import internal from 'void/internal';

export function rateLimitCheck(res: VoidResponse, limit: number, token: string): boolean {
  let usage = internal.cache.get(token) || 0;
  const exceeded = usage >= limit;
  if (!exceeded)
    usage++;
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader(
    'X-RateLimit-Remaining',
    exceeded ? 0 : limit - usage
  );
  res.setHeader('X-RateLimit-Reset', Math.round(internal.cache.getRemainingTTL(token)));
  internal.cache.set(token, usage);
  return exceeded;
}
