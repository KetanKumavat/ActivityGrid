import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { responseCache } from "@/lib/cache";

interface LeetCodeResponse {
    data: {
        matchedUser: {
            submissionCalendar: string;
        };
    };
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json(
            { error: "Username is required" },
            { status: 400 }
        );
    }

    const cacheKey = `leetcode:${username}`;

    const cachedData = responseCache.get<LeetCodeResponse>(cacheKey);
    if (cachedData) {
        return NextResponse.json(cachedData, {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
            },
        });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await axios.post(
            "https://leetcode.com/graphql",
            {
                query: `
          query ($username: String!) {
            matchedUser(username: $username) {
              submissionCalendar
            }
          }
        `,
                variables: { username },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
                },
                timeout: 8000,
                maxBodyLength: 1024 * 500,
                validateStatus: (status: number) => status < 500,
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (!response.data?.data?.matchedUser?.submissionCalendar) {
            const cachedData = responseCache.get<LeetCodeResponse>(cacheKey);
            if (cachedData) {
                return NextResponse.json(cachedData, {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                    },
                });
            }

            return NextResponse.json(
                { error: "No data found for this LeetCode user" },
                { status: 404 }
            );
        }

        responseCache.set(cacheKey, response.data, 2 * 60 * 60 * 1000);

        return NextResponse.json(response.data, {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
            },
        });
    } catch (error: unknown) {
        console.error(
            "LeetCode API error:",
            error instanceof Error ? error.message : error
        );

        const cachedData = responseCache.get<LeetCodeResponse>(cacheKey);
        if (cachedData) {
            console.log("Using cached LeetCode data due to API error");
            return NextResponse.json(cachedData, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }

        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const message =
                status === 404
                    ? "LeetCode user not found"
                    : status === 429
                    ? "LeetCode API rate limit exceeded - please try again later"
                    : "Failed to fetch LeetCode data";

            return NextResponse.json({ error: message }, { status });
        } else if (error instanceof Error && "request" in error) {
            return NextResponse.json(
                { error: "LeetCode API timeout or network error" },
                { status: 504 }
            );
        } else {
            return NextResponse.json(
                {
                    error: "Failed to fetch LeetCode data. Please try again later.",
                },
                { status: 500 }
            );
        }
    }
}
