interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

class InMemoryCache {
    private store = new Map<string, CacheEntry<unknown>>();

    get<T>(key: string): T | null {
        const entry = this.store.get(key) as CacheEntry<T> | undefined;

        if (!entry) {
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }

        return entry.value;
    }

    set<T>(key: string, value: T, ttlMs: number): void {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
        });
    }

    del(key: string): void {
        this.store.delete(key);
    }

    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
            }
        }
    }
}

const inMemoryCache = new InMemoryCache();

// cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
    setInterval(() => inMemoryCache.cleanup(), 5 * 60 * 1000);
}

export const cache = {
    async get<T>(key: string): Promise<T | null> {
        return inMemoryCache.get<T>(key);
    },

    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
        inMemoryCache.set(key, value, ttlMs);
    },

    async del(key: string): Promise<void> {
        inMemoryCache.del(key);
    },
};

export const responseCache = {
    get<T>(key: string): T | null {
        return inMemoryCache.get<T>(key);
    },

    set<T>(key: string, value: T, ttlMs: number): void {
        inMemoryCache.set(key, value, ttlMs);
    },

    del(key: string): void {
        inMemoryCache.del(key);
    },
};
