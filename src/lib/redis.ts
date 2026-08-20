import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// BullMQ requires maxRetriesPerRequest to be null
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});
