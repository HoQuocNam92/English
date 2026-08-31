import { Injectable, Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

/**
 * Distributed lock via Redis SET NX EX.
 *
 * Dùng cho:
 *  - Payment webhook: tránh race condition khi SePay retry cùng transactionId
 *  - Create order: tránh 2 request tạo đơn cùng lúc cho cùng user+plan
 *
 * Giao thức:
 *  1. acquireLock(key, ttl) → true nếu lock thành công, false nếu bị tranh chấp
 *  2. Xử lý business logic
 *  3. releaseLock(key)
 *
 * TTL là safety net — nếu process crash, lock tự release sau TTL.
 *
 * NOTE: Với cache-manager v5 + ioredis, set() với ttl là NX emulation.
 * Để đảm bảo SET NX atomicity, chúng ta dùng ioredis client trực tiếp khi available.
 */
@Injectable()
export class RedisLockService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  /**
   * Try to acquire a distributed lock.
   * @param key   Lock key (e.g. "lock:payment:webhook:TXN123")
   * @param ttlMs Lock TTL in milliseconds (default 30s)
   * @returns true if lock acquired, false if already held by another process
   */
  async acquireLock(key: string, ttlMs = 30_000): Promise<boolean> {
    const lockKey = `lock:${key}`
    const lockValue = `${Date.now()}:${Math.random()}`

    // Try to get underlying ioredis client for atomic SET NX EX
    try {
      const store = (this.cache as any).store
      // ioredis store exposes client directly
      const client = store?.client ?? store?.getClient?.()
      if (client && typeof client.set === 'function') {
        // Atomic SET NX PX — returns 'OK' if set, null if key exists
        const result = await client.set(lockKey, lockValue, 'PX', ttlMs, 'NX')
        return result === 'OK'
      }
    } catch {
      // ioredis not available — fall back to in-memory emulation
    }

    // In-memory cache fallback (dev / test): simulate NX with get+set
    const existing = await this.cache.get(lockKey)
    if (existing !== null && existing !== undefined) return false
    await this.cache.set(lockKey, lockValue, ttlMs)
    return true
  }

  /**
   * Release a lock.
   * In production with ioredis, this deletes the key.
   * In dev fallback, this deletes from in-memory cache.
   */
  async releaseLock(key: string): Promise<void> {
    const lockKey = `lock:${key}`
    try {
      const store = (this.cache as any).store
      const client = store?.client ?? store?.getClient?.()
      if (client && typeof client.del === 'function') {
        await client.del(lockKey)
        return
      }
    } catch {
      // ignore
    }
    await this.cache.del(lockKey)
  }

  /**
   * Execute a function with a lock. Auto-releases lock when done.
   * Returns null if lock cannot be acquired (another process is running).
   */
  async withLock<T>(
    key: string,
    fn: () => Promise<T>,
    ttlMs = 30_000,
  ): Promise<T | null> {
    const acquired = await this.acquireLock(key, ttlMs)
    if (!acquired) return null
    try {
      return await fn()
    } finally {
      await this.releaseLock(key)
    }
  }
}
