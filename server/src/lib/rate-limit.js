// Fixed-window in-memory rate limiter.
// Good enough for a single Node instance; swap for Redis/Upstash when running
// multiple serverless instances, since each instance keeps its own counters.

const buckets = new Map();
const MAX_BUCKETS = 10_000;

export function rateLimit(key, limit, windowMs, now = Date.now()) {
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterMs: allowed ? 0 : bucket.resetAt - now,
  };
}

/** Express middleware: at most `limit` requests per `windowMs` per client IP for this route group. */
export function rateLimitMiddleware({ key, limit, windowMs }) {
  return (req, res, next) => {
    const result = rateLimit(`${key}:${req.ip}`, limit, windowMs);
    if (result.allowed) return next();
    res.set("Retry-After", String(Math.ceil(result.retryAfterMs / 1000)));
    res
      .status(429)
      .json({ error: { code: "RATE_LIMITED", message: "Too many requests. Please slow down." } });
  };
}
