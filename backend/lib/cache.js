const DEFAULT_TTL = 15_000;

function createCache(ttl = DEFAULT_TTL) {
  const store = new Map();
  const staleStore = new Map();

  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() >= entry.expiresAt) {
        staleStore.set(key, entry.data);
        store.delete(key);
        return undefined;
      }
      return entry.data;
    },
    getStale(key) {
      return staleStore.get(key);
    },
    set(key, data) {
      store.set(key, { data, expiresAt: Date.now() + ttl });
      staleStore.set(key, data);
    },
  };
}

module.exports = { createCache };
