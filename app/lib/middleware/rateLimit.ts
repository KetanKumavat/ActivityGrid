/**
 * Rate limiting middleware for Next.js API routes
 */

import type { NextApiRequest, NextApiResponse } from "next";

interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (now > entry.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

/**
 * Get client IP address from request
 */
function getClientIp(req: NextApiRequest): string {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
        ? typeof forwarded === "string"
            ? forwarded.split(",")[0]
            : forwarded[0]
        : req.socket.remoteAddress || "unknown";
    return ip;
}

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit(
    handler: (
        req: NextApiRequest,
        res: NextApiResponse
    ) => Promise<void | NextApiResponse>,
    options: RateLimitOptions
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const ip = getClientIp(req);
        const key = `ratelimit:${ip}`;
        const now = Date.now();

        // Get or create rate limit entry
        let entry = rateLimitStore.get(key);

        if (!entry || now > entry.resetTime) {
            // Create new entry
            entry = {
                count: 0,
                resetTime: now + options.windowMs,
            };
            rateLimitStore.set(key, entry);
        }

        // Increment counter
        entry.count++;

        // Set rate limit headers
        res.setHeader("X-RateLimit-Limit", options.max.toString());
        res.setHeader(
            "X-RateLimit-Remaining",
            Math.max(0, options.max - entry.count).toString()
        );
        res.setHeader(
            "X-RateLimit-Reset",
            new Date(entry.resetTime).toISOString()
        );

        // Check if limit exceeded
        if (entry.count > options.max) {
            return res.status(429).json({
                error:
                    options.message ||
                    "Too many requests, please try again later.",
                retryAfter: Math.ceil((entry.resetTime - now) / 1000),
            });
        }

        // Continue to handler
        return handler(req, res);
    };
}
