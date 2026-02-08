// TTL cache with stale fallback
// if a fresh fetch fails, we can return stale data instead of nothing

const DEFAULT_TTL = 15_000; // 15 seconds

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export function createCache<T>(ttl = DEFAULT_TTL) {
  const store = new Map<string, CacheEntry<T>>();
  // stale entries kept separately so we can fallback
  const staleStore = new Map<string, T>();

  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() >= entry.expiresAt) {
        // expired - move to stale and remove from main
        staleStore.set(key, entry.data);
        store.delete(key);
        return undefined;
      }
      return entry.data;
    },

    // get stale data as fallback when fresh fetch fails
    getStale(key: string): T | undefined {
      return staleStore.get(key);
    },

    set(key: string, data: T) {
      store.set(key, { data, expiresAt: Date.now() + ttl });
      staleStore.set(key, data); // always keep as stale backup
    },
  };
}
