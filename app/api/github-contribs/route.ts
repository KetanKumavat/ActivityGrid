import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { responseCache } from "@/lib/cache";

interface GitHubResponse {
    data: {
        user: {
            contributionsCollection: {
                contributionCalendar: {
                    totalContributions: number;
                    weeks: {
                        contributionDays: {
                            contributionCount: number;
                            date: string;
                        }[];
                    }[];
                };
            };
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

    // Generate cache key
    const cacheKey = `github:${username}`;

    // Check if we have a fresh cached response
    const cachedData = responseCache.get<GitHubResponse>(cacheKey);
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
        const query = `
      query ($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
            console.error("GitHub token is not configured");

            const cachedData = responseCache.get<GitHubResponse>(cacheKey);
            if (cachedData) {
                return NextResponse.json(cachedData, {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                    },
                });
            }

            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await axios.post(
            "https://api.github.com/graphql",
            { query, variables: { login: username } },
            {
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                    "Content-Type": "application/json",
                },
                timeout: 8000,
                maxBodyLength: 1024 * 500,
                validateStatus: (status: number) => status < 500,
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (!response.data?.data?.user?.contributionsCollection) {
            const cachedData = responseCache.get<GitHubResponse>(cacheKey);
            if (cachedData) {
                return NextResponse.json(cachedData, {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                    },
                });
            }

            return NextResponse.json(
                { error: "No valid data found for this user" },
                { status: 404 }
            );
        }

        responseCache.set(cacheKey, response.data, 60 * 60 * 1000);

        return NextResponse.json(response.data, {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
            },
        });
    } catch (error: unknown) {
        console.error(
            "GitHub API error:",
            error instanceof Error ? error.message : error
        );

        const cachedData = responseCache.get<GitHubResponse>(cacheKey);
        if (cachedData) {
            console.log("Using cached GitHub data due to API error");
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
                    ? "GitHub user not found"
                    : status === 403
                    ? "GitHub API rate limit exceeded"
                    : status === 429
                    ? "Too many requests, please try again later"
                    : "Failed to fetch GitHub data";

            return NextResponse.json({ error: message }, { status });
        } else if (error instanceof Error && "request" in error) {
            return NextResponse.json(
                { error: "GitHub API timeout or network error" },
                { status: 504 }
            );
        } else {
            return NextResponse.json(
                {
                    error: "Failed to fetch GitHub data. Please try again later.",
                },
                { status: 500 }
            );
        }
    }
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
