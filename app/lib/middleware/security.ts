/**
 * Security middleware for Next.js API routes
 */

import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Security headers and basic protections
 */
export function withSecurity(
    handler: (
        req: NextApiRequest,
        res: NextApiResponse
    ) => Promise<void | NextApiResponse>
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        // Set security headers
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "SAMEORIGIN");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Handle OPTIONS for CORS preflight
        if (req.method === "OPTIONS") {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            return res.status(200).end();
        }

        // Continue to handler
        return handler(req, res);
    };
}
