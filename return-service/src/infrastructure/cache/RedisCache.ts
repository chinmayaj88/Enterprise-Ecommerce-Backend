import Redis from 'ioredis';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';

const logger = createLogger();
const config = getConfig();

let redisClient: Redis | null = null;
let cacheEnabled = false;

export function getCache() {
  if (!redisClient && config.redis?.url) {
    try {
      redisClient = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          if (times > 3) {
            return null;
          }
          return Math.min(times * 200, 2000);
        },
      });

      redisClient.on('connect', () => {
        logger.info('Redis connected');
        cacheEnabled = true;
      });

      redisClient.on('error', (error: Error) => {
        logger.warn('Redis connection error', { error: error.message });
        cacheEnabled = false;
      });

      redisClient.on('close', () => {
        logger.warn('Redis connection closed');
        cacheEnabled = false;
      });
    } catch (error) {
      logger.warn('Failed to initialize Redis', { error });
      cacheEnabled = false;
    }
  }

  const memoryCache = new Map<string, { value: any; expiry: number }>();

  return {
    async get<T>(key: string): Promise<T | null> {
      if (!cacheEnabled || !redisClient) {
        const cached = memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.value as T;
        }
        if (cached) {
          memoryCache.delete(key);
        }
        return null;
      }

      try {
        const value = await redisClient.get(key);
        if (!value) {
          return null;
        }
        return JSON.parse(value) as T;
      } catch (error) {
        logger.warn('Redis get error', { error, key });
        return null;
      }
    },

    async set(key: string, value: any, ttl: number = 3600): Promise<void> {
      if (!cacheEnabled || !redisClient) {
        memoryCache.set(key, {
          value,
          expiry: Date.now() + ttl * 1000,
        });
        return;
      }

      try {
        await redisClient.setex(key, ttl, JSON.stringify(value));
      } catch (error) {
        logger.warn('Redis set error', { error, key });
      }
    },

    async del(key: string): Promise<void> {
      memoryCache.delete(key);

      if (!cacheEnabled || !redisClient) {
        return;
      }

      try {
        await redisClient.del(key);
      } catch (error) {
        logger.warn('Redis del error', { error, key });
      }
    },

    async disconnect(): Promise<void> {
      if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        cacheEnabled = false;
        logger.info('Redis disconnected');
      }
    },
  };
}

