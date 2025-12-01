"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { UsernameInputs } from "@/components/UsernameInputs";
import { AppearanceSettings } from "@/components/AppearanceSettings";
import { HeatmapPreview } from "@/components/HeatmapPreview";
import { EmbedCode } from "@/components/EmbedCode";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { HeatmapResponse, PaletteType } from "@/lib/types";

export default function Home() {
    const [githubUsername, setGithubUsername] = useState("ketankumavat");
    const [leetcodeUsername, setLeetcodeUsername] = useState("ketankumavat");
    const [palette, setPalette] = useState<PaletteType>("github");
    const [cellSize, setCellSize] = useState(16);
    const [showLegend, setShowLegend] = useState(true);
    const [compact, setCompact] = useState(false);
    const [autoResize, setAutoResize] = useState(true);
    const [copied, setCopied] = useState(false);
    const [data, setData] = useState<HeatmapResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedGithub = useDebounce(githubUsername, 800);
    const debouncedLeetcode = useDebounce(leetcodeUsername, 800);

    useEffect(() => {
        async function fetchData() {
            if (!debouncedGithub && !debouncedLeetcode) {
                setData(null);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (debouncedGithub) params.set("github", debouncedGithub);
                if (debouncedLeetcode)
                    params.set("leetcode", debouncedLeetcode);

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
            } catch (err) {
                console.error("Failed to fetch heatmap data:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to load data"
                );
                setData(null);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [debouncedGithub, debouncedLeetcode]);

    const generateIframeUrl = useCallback(() => {
        const params = new URLSearchParams();
        if (githubUsername) params.set("github", githubUsername);
        if (leetcodeUsername) params.set("leetcode", leetcodeUsername);
        params.set("palette", palette);
        params.set("cell", cellSize.toString());
        params.set("showLegend", showLegend ? "1" : "0");
        if (compact) params.set("compact", "1");
        if (autoResize) params.set("autoResize", "1");

        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            (typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000");
        return `${baseUrl}/widget?${params.toString()}`;
    }, [
        githubUsername,
        leetcodeUsername,
        palette,
        cellSize,
        showLegend,
        compact,
        autoResize,
    ]);

    const generateIframeCode = useCallback(() => {
        const url = generateIframeUrl();
        const width = compact ? 600 : 900;
        const height = compact ? 150 : 200;

        if (autoResize) {
            return `<iframe id="heatmap-widget" src="${url}" width="${width}" height="${height}" frameborder="0" scrolling="no" style="border: none; overflow: hidden;"></iframe>
<script>
  window.addEventListener('message', (event) => {
    if (event.data.type === 'dh-height') {
      document.getElementById('heatmap-widget').style.height = event.data.height + 'px';
    }
  });
</script>`;
        }

        return `<iframe src="${url}" width="${width}" height="${height}" frameborder="0" style="border: none;"></iframe>`;
    }, [generateIframeUrl, compact, autoResize]);

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(generateIframeCode());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }, [generateIframeCode]);

    const isValid = useMemo(
        () => !!(githubUsername || leetcodeUsername),
        [githubUsername, leetcodeUsername]
    );

    const embedCode = useMemo(() => generateIframeCode(), [generateIframeCode]);

    return (
        <div className="relative min-h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors overflow-hidden">
            {/* Globe background */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl aspect-square pointer-events-none opacity-30">
                <img
                    src="/globe-outline-light.svg"
                    alt=""
                    className="w-full h-full object-contain dark:hidden"
                />
                <img
                    src="/globe-outline-dark.svg"
                    alt=""
                    className="w-full h-full object-contain hidden dark:block"
                />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent leading-loose ">
                        Generate Your Activity Heatmap
                    </h1>
                    <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        Create a unified contribution heatmap from GitHub and
                        LeetCode. Customize it, embed it in your portfolio, and
                        and let it show your consistency.
                    </p>
                </div>

                <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <UsernameInputs
                            githubUsername={githubUsername}
                            leetcodeUsername={leetcodeUsername}
                            onGithubChange={setGithubUsername}
                            onLeetcodeChange={setLeetcodeUsername}
                        />

                        <AppearanceSettings
                            palette={palette}
                            cellSize={cellSize}
                            showLegend={showLegend}
                            compact={compact}
                            autoResize={autoResize}
                            onPaletteChange={setPalette}
                            onCellSizeChange={setCellSize}
                            onShowLegendChange={setShowLegend}
                            onCompactChange={setCompact}
                            onAutoResizeChange={setAutoResize}
                        />
                    </div>

                    <HeatmapPreview
                        isValid={isValid}
                        loading={loading}
                        error={error}
                        data={data}
                        palette={palette}
                        cellSize={cellSize}
                        showLegend={showLegend}
                        compact={compact}
                    />

                    {isValid && (
                        <EmbedCode
                            embedCode={embedCode}
                            copied={copied}
                            onCopy={copyToClipboard}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
