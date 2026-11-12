// A small in-memory cache for API responses.
//
// Each entry is saved under a key (e.g. "crew:member:5") together with the time
// it was made. Entries older than CACHE_TIME are treated as expired and fetched again.
//
// The Promise is cached, not the data. So two requests for the same key at the
// same time share one request, and a request that was started before invalidate()
// can never put old data back into the cache.
const CACHE_TIME = 60 * 1000; // 60 seconds

const cache = new Map(); // key -> { promise, savedAt }

export function cachedRequest(key, request) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.savedAt < CACHE_TIME) {
        return entry.promise;
    }

    const promise = request();
    cache.set(key, { promise, savedAt: Date.now() });

    // Errors are not cached: remove the entry so the next call tries again.
    promise.catch(() => {
        if (cache.get(key)?.promise === promise) cache.delete(key);
    });

    return promise;
}

// Removes every entry whose key starts with `prefix`.
export function invalidateCache(prefix) {
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) cache.delete(key);
    }
}
