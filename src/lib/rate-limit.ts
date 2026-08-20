import { redis } from './redis';

export async function checkRateLimit(ip: string, limit: number, windowSecs: number) {
  const key = `rate-limit:${ip}`;
  
  // Use a Redis transaction to ensure atomic increment and expire
  const [current] = await redis
    .multi()
    .incr(key)
    .expire(key, windowSecs, 'NX') // 'NX' only sets expiry if it doesn't already have one
    .exec() as any;

  // current[1] contains the result of the INCR command
  const requestCount = current[1] as number;
  
  return requestCount <= limit;
}
