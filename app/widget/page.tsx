"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HeatmapGrid } from "@/components/HeatmapGrid";

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

function WidgetContent() {
    const searchParams = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<HeatmapResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const github = searchParams.get("github");
    const leetcode = searchParams.get("leetcode");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const palette =
        (searchParams.get("palette") as
            | "github"
            | "blue"
            | "mono"
            | "sunset") || "github";
    const cellSize = parseInt(searchParams.get("cell") || "12");
    const showLegend = searchParams.get("showLegend") !== "0";
    const compact = searchParams.get("compact") === "1";
    const autoResize = searchParams.get("autoResize") === "1";

    useEffect(() => {
        async function fetchData() {
            if (!github && !leetcode) {
                setError(
                    "At least one username (github or leetcode) is required"
                );
                setLoading(false);
                return;
            }

            try {
                const params = new URLSearchParams();
                if (github) params.set("github", github);
                if (leetcode) params.set("leetcode", leetcode);
                if (from) params.set("from", from);
                if (to) params.set("to", to);

                const response = await fetch(
                    `/api/heatmap?${params.toString()}`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    const errorData = await response
                        .json()
                        .catch(() => ({ error: "Unknown error" }));
                    throw new Error(
                        errorData.error || `HTTP ${response.status}`
                    );
                }

                const jsonData = await response.json();
                setData(jsonData);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch heatmap data:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to load data"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [github, leetcode, from, to]);

    // Auto-resize support
    useEffect(() => {
        if (!autoResize || !containerRef.current) return;

        const sendHeight = () => {
            if (containerRef.current) {
                const height = containerRef.current.scrollHeight;
                window.parent.postMessage({ type: "dh-height", height }, "*");
            }
        };

        sendHeight();

        let timeout: NodeJS.Timeout;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(sendHeight, 100);
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            clearTimeout(timeout);
        };
    }, [autoResize, data]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px] text-zinc-600 dark:text-zinc-400">
                <div className="animate-pulse">Loading heatmap...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[200px] text-red-600 dark:text-red-400">
                <div className="text-center">
                    <div className="font-semibold mb-2">
                        Error loading heatmap
                    </div>
                    <div className="text-sm">{error}</div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[200px] text-zinc-600 dark:text-zinc-400">
                No data available
            </div>
        );
    }

    const hasPartialErrors =
        data.meta.errors &&
        (data.meta.errors.github || data.meta.errors.leetcode);

    return (
        <div ref={containerRef} className="p-4">
            {hasPartialErrors && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
                    <div className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                        Partial data available
                    </div>
                    {data.meta.errors?.github && (
                        <div className="text-yellow-800 dark:text-yellow-300">
                            GitHub: {data.meta.errors.github}
                        </div>
                    )}
                    {data.meta.errors?.leetcode && (
                        <div className="text-yellow-800 dark:text-yellow-300">
                            LeetCode: {data.meta.errors.leetcode}
                        </div>
                    )}
                </div>
            )}

            <div className="mb-3">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Contribution Activity
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {data.meta.github && `GitHub: ${data.meta.github}`}
                    {data.meta.github && data.meta.leetcode && " • "}
                    {data.meta.leetcode && `LeetCode: ${data.meta.leetcode}`}
                </p>
            </div>

            <HeatmapGrid
                days={data.days}
                fromDate={data.meta.from}
                toDate={data.meta.to}
                palette={palette}
                cellSize={cellSize}
                showLegend={showLegend}
                compact={compact}
            />
        </div>
    );
}

export default function WidgetPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[200px] text-zinc-600 dark:text-zinc-400">
                    <div className="animate-pulse">Loading...</div>
                </div>
            }
        >
            <WidgetContent />
        </Suspense>
    );
}
