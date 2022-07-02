import TTLCache from '@isaacs/ttlcache';
import {VoidResponse} from 'middleware/withVoid';

function getCache(): TTLCache<string, number> {
  if (!global.cache) global.cache = new TTLCache({
    max: 500,
    ttl: 60 * 60 * 1e3,
    noUpdateTTL: true
  });
  return global.cache;
}

export function check(res: VoidResponse, limit: number, token: string) {
  const cache = getCache();
  let usage = cache.get(token) || 0;
  const exceeded = usage >= limit;
  if (!exceeded)
    usage++;
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader(
    'X-RateLimit-Remaining',
    exceeded ? 0 : limit - usage
  );
  res.setHeader('X-RateLimit-Reset', Math.round(cache.getRemainingTTL(token)));
  cache.set(token, usage);
  return exceeded;
}
