import NodeCache from "node-cache";
import crypto from "crypto";

/**
 * Cache utility for external API responses
 * TTL: 24 hours (86400 seconds)
 * Astrological calculations are deterministic, so results don't change
 */
class ApiCache {
  private cache: NodeCache;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
  };

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 86400, // 24 hours
      checkperiod: 3600, // Check for expired keys every hour
      useClones: false, // Don't clone objects (faster, but be careful with mutations)
    });

    // Log cache stats every 5 minutes
    setInterval(() => this.logStats(), 300000);
  }

  /**
   * Generate a cache key from endpoint and parameters
   */
  generateKey(endpoint: string, params: any): string {
    const dataString = JSON.stringify({ endpoint, params });
    return crypto.createHash("md5").update(dataString).digest("hex");
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.stats.hits++;
      console.log(`✅ [CACHE HIT] Key: ${key.substring(0, 8)}...`);
    } else {
      this.stats.misses++;
      console.log(`❌ [CACHE MISS] Key: ${key.substring(0, 8)}...`);
    }
    return value;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    this.stats.sets++;
    console.log(`💾 [CACHE SET] Key: ${key.substring(0, 8)}...`);
    return this.cache.set(key, value, ttl || 86400);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.flushAll();
    console.log("🗑️ [CACHE] Cleared all cache");
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? (
            (this.stats.hits / (this.stats.hits + this.stats.misses)) *
            100
          ).toFixed(2)
        : "0.00";

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      keys: this.cache.keys().length,
    };
  }

  /**
   * Log cache statistics
   */
  private logStats(): void {
    const stats = this.getStats();
    console.log("📊 [CACHE STATS]", stats);
  }
}

// Export singleton instance
export const apiCache = new ApiCache();
