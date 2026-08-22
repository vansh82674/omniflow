import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function checkRateLimit(ip: string, limit: number, windowSecs: number) {
  // Use a sliding window rate limiter
  const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSecs} s`),
    analytics: true,
  });

  const { success } = await ratelimit.limit(`rate-limit:${ip}`);
  return success;
}
