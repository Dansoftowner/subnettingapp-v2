import rateLimit, { MemoryStore } from 'express-rate-limit';

export const generalRateLimiterStore = new MemoryStore();
export const authRateLimiterStore = new MemoryStore();

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  store: generalRateLimiterStore,
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 100, // 1 minute
  limit: 10,
  store: authRateLimiterStore,
});
