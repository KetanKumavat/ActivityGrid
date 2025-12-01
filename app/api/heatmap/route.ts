import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/cache";

interface HeatmapDay {
    total: number;
    github: number;
    leetcode: number;
}

interface HeatmapResponse {
    meta: {
        github: string | null;
        leetcode: string | null;
        from: string;
        to: string;
        generatedAt: string;
        cacheHit: boolean;
        errors?: {
            github?: string | null;
            leetcode?: string | null;
        };
    };
    days: Record<string, HeatmapDay>;
}

interface GitHubContribution {
    contributionCount: number;
    date: string;
}

interface LeetCodeSubmissionCalendar {
    [timestamp: string]: number;
}

/**
 * Parse LeetCode submission calendar (can be JSON string or object)
 */
function parseLeetCodeCalendar(
    calendar: string | LeetCodeSubmissionCalendar
): Record<string, number> {
    try {
        // If it's already an object
        if (typeof calendar === "object") {
            const result: Record<string, number> = {};
            for (const [timestamp, count] of Object.entries(calendar)) {
                const date = new Date(parseInt(timestamp) * 1000)
                    .toISOString()
                    .split("T")[0];
                result[date] = count;
            }
            return result;
        }

        // Try to parse as JSON
        const parsed = JSON.parse(calendar);
        const result: Record<string, number> = {};
        for (const [timestamp, count] of Object.entries(parsed)) {
            const date = new Date(parseInt(timestamp) * 1000)
                .toISOString()
                .split("T")[0];
            result[date] = count as number;
        }
        return result;
    } catch (error) {
        // Fallback: try regex parsing for "timestamp":count pairs
        const result: Record<string, number> = {};
        const regex = /"(\d+)"\s*:\s*(\d+)/g;
        let match;

        while ((match = regex.exec(calendar as string)) !== null) {
            const timestamp = parseInt(match[1]);
            const count = parseInt(match[2]);
            const date = new Date(timestamp * 1000).toISOString().split("T")[0];
            result[date] = count;
        }

        return result;
    }
}

/**
 * Fetch GitHub contributions
 */
async function fetchGitHubContributions(
    username: string,
    baseUrl: string
): Promise<{ data: Record<string, number>; error: string | null }> {
    try {
        const url = `${baseUrl}/api/github-contribs?username=${encodeURIComponent(
            username
        )}`;
        const response = await fetch(url, {
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: "Unknown error" }));
            return {
                data: {},
                error: error.error || `HTTP ${response.status}`,
            };
        }

        const json = await response.json();
        const contributions: Record<string, number> = {};

        const weeks =
            json.data?.user?.contributionsCollection?.contributionCalendar
                ?.weeks;
        if (weeks && Array.isArray(weeks)) {
            for (const week of weeks) {
                for (const day of week.contributionDays || []) {
                    contributions[day.date] = day.contributionCount;
                }
            }
        }

        return { data: contributions, error: null };
    } catch (error) {
        console.error("GitHub fetch error:", error);
        return {
            data: {},
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch GitHub data",
        };
    }
}

/**
 * Fetch LeetCode contributions
 */
async function fetchLeetCodeContributions(
    username: string,
    baseUrl: string
): Promise<{ data: Record<string, number>; error: string | null }> {
    try {
        const url = `${baseUrl}/api/leetcode-contribs?username=${encodeURIComponent(
            username
        )}`;
        const response = await fetch(url, {
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: "Unknown error" }));
            return {
                data: {},
                error: error.error || `HTTP ${response.status}`,
            };
        }

        const json = await response.json();
        const calendar = json.data?.matchedUser?.submissionCalendar;

        if (!calendar) {
            return { data: {}, error: "No submission calendar found" };
        }

        const contributions = parseLeetCodeCalendar(calendar);
        return { data: contributions, error: null };
    } catch (error) {
        console.error("LeetCode fetch error:", error);
        return {
            data: {},
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch LeetCode data",
        };
    }
}

/**
 * Merge GitHub and LeetCode contributions into unified heatmap
 */
function mergeContributions(
    github: Record<string, number>,
    leetcode: Record<string, number>,
    fromDate: Date,
    toDate: Date,
    includeZeros: boolean
): Record<string, HeatmapDay> {
    const days: Record<string, HeatmapDay> = {};

    // Combine all unique dates
    const allDates = new Set([
        ...Object.keys(github),
        ...Object.keys(leetcode),
    ]);

    for (const dateStr of allDates) {
        const date = new Date(dateStr);

        // Filter by date range
        if (date < fromDate || date > toDate) {
            continue;
        }

        const githubCount = github[dateStr] || 0;
        const leetcodeCount = leetcode[dateStr] || 0;
        const total = githubCount + leetcodeCount;

        // Skip zeros unless explicitly requested
        if (total === 0 && !includeZeros) {
            continue;
        }

        days[dateStr] = {
            total,
            github: githubCount,
            leetcode: leetcodeCount,
        };
    }

    return days;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const githubUsername = searchParams.get("github");
    const leetcodeUsername = searchParams.get("leetcode");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const cacheTTLParam = searchParams.get("cacheTTL");
    const includeZeros = searchParams.get("includeZeros") === "1";

    // Validate at least one username is provided
    if (!githubUsername && !leetcodeUsername) {
        return NextResponse.json(
            { error: "At least one username (github or leetcode) is required" },
            { status: 400 }
        );
    }

    // Parse date range
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const fromDate = fromParam ? new Date(fromParam) : oneYearAgo;
    const toDate = toParam ? new Date(toParam) : today;

    // Validate dates
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return NextResponse.json(
            { error: "Invalid date format. Use ISO 8601 (YYYY-MM-DD)" },
            { status: 400 }
        );
    }

    // Generate cache key
    const cacheKey = `heatmap:${githubUsername || "none"}:${
        leetcodeUsername || "none"
    }:${fromDate.toISOString().split("T")[0]}:${
        toDate.toISOString().split("T")[0]
    }`;

    // Check cache
    const cachedData = await cache.get<HeatmapResponse>(cacheKey);
    if (cachedData) {
        return NextResponse.json(
            { ...cachedData, meta: { ...cachedData.meta, cacheHit: true } },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                },
            }
        );
    }

    // Determine base URL for internal API calls
    const baseUrl = process.env.SITE_URL || "http://localhost:3000";

    // Fetch data from both providers in parallel
    const [githubResult, leetcodeResult] = await Promise.all([
        githubUsername
            ? fetchGitHubContributions(githubUsername, baseUrl)
            : Promise.resolve({ data: {}, error: null }),
        leetcodeUsername
            ? fetchLeetCodeContributions(leetcodeUsername, baseUrl)
            : Promise.resolve({ data: {}, error: null }),
    ]);

    // Check if both failed
    if (githubResult.error && leetcodeResult.error) {
        return NextResponse.json(
            {
                error: "Failed to fetch data from all providers",
                details: {
                    github: githubResult.error,
                    leetcode: leetcodeResult.error,
                },
            },
            { status: 503 }
        );
    }

    // Merge contributions
    const days = mergeContributions(
        githubResult.data,
        leetcodeResult.data,
        fromDate,
        toDate,
        includeZeros
    );

    // Build response
    const response: HeatmapResponse = {
        meta: {
            github: githubUsername,
            leetcode: leetcodeUsername,
            from: fromDate.toISOString().split("T")[0],
            to: toDate.toISOString().split("T")[0],
            generatedAt: new Date().toISOString(),
            cacheHit: false,
        },
        days,
    };

    // Add errors to meta if any provider failed
    if (githubResult.error || leetcodeResult.error) {
        response.meta.errors = {
            github: githubResult.error,
            leetcode: leetcodeResult.error,
        };
    }

    // Cache the response
    const cacheTTL = cacheTTLParam
        ? parseInt(cacheTTLParam) * 1000
        : 10 * 60 * 1000; // Default 10 minutes
    await cache.set(cacheKey, response, cacheTTL);

    return NextResponse.json(response, {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
    });
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
