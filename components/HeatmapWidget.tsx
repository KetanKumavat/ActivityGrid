"use client";

import { useEffect, useRef, useState } from "react";

export interface HeatmapWidgetProps {
    github?: string;
    leetcode?: string;
    from?: string;
    to?: string;
    palette?: "github" | "blue" | "mono" | "sunset";
    cellSize?: number;
    showLegend?: boolean;
    compact?: boolean;
    autoResize?: boolean;
    width?: number | string;
    height?: number | string;
    className?: string;
}

/**
 * React wrapper component for the heatmap widget iframe
 *
 * @example
 * ```tsx
 * <HeatmapWidget
 *   github="octocat"
 *   palette="github"
 *   autoResize
 * />
 * ```
 */
export function HeatmapWidget({
    github,
    leetcode,
    from,
    to,
    palette = "github",
    cellSize = 12,
    showLegend = true,
    compact = false,
    autoResize = true,
    width = 900,
    height = 200,
    className = "",
}: HeatmapWidgetProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeHeight, setIframeHeight] = useState(height);

    // Build widget URL
    const params = new URLSearchParams();
    if (github) params.set("github", github);
    if (leetcode) params.set("leetcode", leetcode);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("palette", palette);
    params.set("cell", cellSize.toString());
    params.set("showLegend", showLegend ? "1" : "0");
    if (compact) params.set("compact", "1");
    if (autoResize) params.set("autoResize", "1");

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const widgetUrl = `${baseUrl}/widget?${params.toString()}`;

    // Listen for height updates from iframe
    useEffect(() => {
        if (!autoResize) return;

        const handleMessage = (event: MessageEvent) => {
            if (
                event.data.type === "dh-height" &&
                typeof event.data.height === "number"
            ) {
                setIframeHeight(event.data.height);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [autoResize]);

    if (!github && !leetcode) {
        return (
            <div
                className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}
            >
                <p className="text-red-800 dark:text-red-200">
                    At least one username (github or leetcode) is required
                </p>
            </div>
        );
    }

    return (
        <iframe
            ref={iframeRef}
            src={widgetUrl}
            width={width}
            height={autoResize ? iframeHeight : height}
            style={{ border: "none", overflow: "hidden" }}
            className={className}
            title="Contribution Heatmap Widget"
            loading="lazy"
        />
    );
}
