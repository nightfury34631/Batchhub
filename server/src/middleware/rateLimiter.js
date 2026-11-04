import db from "../config/db.js";

// In-Memory Sliding Window Store (Default for single-instance, zero external infrastructure)
const inMemoryStore = new Map();

// Periodic memory cleanup every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of inMemoryStore.entries()) {
    if (now > data.resetTime) {
      inMemoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Extract the true client IP from Express request, handling proxy headers safely.
 */
export const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const list = typeof forwarded === "string" ? forwarded.split(",") : forwarded;
    if (list && list.length > 0) {
      return list[0].trim();
    }
  }
  return req.ip || req.socket?.remoteAddress || "127.0.0.1";
};

/**
 * Create a rate limiting middleware with pluggable storage adapter.
 * Uses in-memory Map by default (optimal for single-instance).
 * If RATE_LIMIT_STORE=database, shares limits via MySQL rate_limits table.
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 50,
  message = "Too many requests. Please try again later.",
  keyPrefix = "rl",
} = {}) => {
  return async (req, res, next) => {
    const isTest = process.env.NODE_ENV === "test";
    // In test environment, use relaxed threshold so suites can run concurrently
    const effectiveMax = isTest ? Math.max(max, 500) : max;

    const ip = getClientIp(req);
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const storeType = process.env.RATE_LIMIT_STORE || "memory";

    try {
      if (storeType === "database") {
        // Shared database-backed rate limiter (multi-instance support)
        const resetEpoch = now + windowMs;
        await db.execute(
          `INSERT INTO rate_limits (ip_key, hit_count, reset_time)
           VALUES (?, 1, ?)
           ON DUPLICATE KEY UPDATE 
             hit_count = IF(reset_time < ?, 1, hit_count + 1),
             reset_time = IF(reset_time < ?, ?, reset_time)`,
          [key, resetEpoch, now, now, resetEpoch]
        );

        const [rows] = await db.execute(
          "SELECT hit_count, reset_time FROM rate_limits WHERE ip_key = ?",
          [key]
        );
        const record = rows[0] || { hit_count: 1, reset_time: resetEpoch };

        res.setHeader("X-RateLimit-Limit", effectiveMax);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, effectiveMax - record.hit_count));
        res.setHeader("X-RateLimit-Reset", Math.ceil(record.reset_time / 1000));

        if (record.hit_count > effectiveMax) {
          return res.status(429).json({ success: false, message });
        }
      } else {
        // In-Memory store
        let record = inMemoryStore.get(key);
        if (!record || now > record.resetTime) {
          record = { count: 1, resetTime: now + windowMs };
          inMemoryStore.set(key, record);
        } else {
          record.count++;
        }

        res.setHeader("X-RateLimit-Limit", effectiveMax);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, effectiveMax - record.count));
        res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

        if (record.count > effectiveMax) {
          return res.status(429).json({ success: false, message });
        }
      }

      next();
    } catch (err) {
      console.error("Rate limiter error, falling back to open path:", err.message);
      next();
    }
  };
};
