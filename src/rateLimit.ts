const DEFAULT_WINDOW_MS = 60_000
const DEFAULT_MAX_REQUESTS = 100

interface BucketEntry {
  count: number
  resetAt: number
}

export class RateLimiter {
  private buckets = new Map<string, BucketEntry>()
  private windowMs: number
  private maxRequests: number

  constructor(maxRequests = DEFAULT_MAX_REQUESTS, windowMs = DEFAULT_WINDOW_MS) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  allow(key: string): boolean {
    const now = Date.now()
    const entry = this.buckets.get(key)

    if (!entry || now >= entry.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs })
      return true
    }

    if (entry.count >= this.maxRequests) return false

    entry.count++
    return true
  }

  remaining(key: string): number {
    const now = Date.now()
    const entry = this.buckets.get(key)
    if (!entry || now >= entry.resetAt) return this.maxRequests
    return Math.max(0, this.maxRequests - entry.count)
  }

  resetAt(key: string): number | null {
    const entry = this.buckets.get(key)
    if (!entry || Date.now() >= entry.resetAt) return null
    return entry.resetAt
  }

  purgeExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.buckets) {
      if (now >= entry.resetAt) this.buckets.delete(key)
    }
  }
}
