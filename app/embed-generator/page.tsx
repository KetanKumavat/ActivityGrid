"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Sun, Moon } from "lucide-react";

export default function EmbedGenerator() {
    const [githubUsername, setGithubUsername] = useState("");
    const [leetcodeUsername, setLeetcodeUsername] = useState("");
    const [palette, setPalette] = useState<
        "github" | "blue" | "mono" | "sunset"
    >("github");
    const [cellSize, setCellSize] = useState(12);
    const [showLegend, setShowLegend] = useState(true);
    const [compact, setCompact] = useState(false);
    const [autoResize, setAutoResize] = useState(true);
    const [copied, setCopied] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Initialize dark mode from system preference
    useEffect(() => {
        const isDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;
        setDarkMode(isDark);
        document.documentElement.classList.toggle("dark", isDark);
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.classList.toggle("dark", newMode);
    };

    const generateIframeUrl = () => {
        const params = new URLSearchParams();
        if (githubUsername) params.set("github", githubUsername);
        if (leetcodeUsername) params.set("leetcode", leetcodeUsername);
        params.set("palette", palette);
        params.set("cell", cellSize.toString());
        params.set("showLegend", showLegend ? "1" : "0");
        if (compact) params.set("compact", "1");
        if (autoResize) params.set("autoResize", "1");

        const baseUrl =
            typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000";
        return `${baseUrl}/widget?${params.toString()}`;
    };

    const generateIframeCode = () => {
        const url = generateIframeUrl();
        const width = compact ? 600 : 900;
        const height = compact ? 150 : 200;

        if (autoResize) {
            return `<!-- Heatmap Widget with Auto-resize -->
<iframe 
  id="heatmap-widget"
  src="${url}"
  width="${width}"
  height="${height}"
  frameborder="0"
  scrolling="no"
  style="border: none; overflow: hidden;"
></iframe>
<script>
  window.addEventListener('message', (event) => {
    if (event.data.type === 'dh-height') {
      const iframe = document.getElementById('heatmap-widget');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>`;
        }

        return `<iframe 
  src="${url}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: none;"
></iframe>`;
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generateIframeCode());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const isValid = githubUsername || leetcodeUsername;
    const previewUrl = isValid ? generateIframeUrl() : "";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                            Heatmap Embed Generator
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                            Create an embeddable contribution heatmap widget
                        </p>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className="p-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? (
                            <Sun className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                        ) : (
                            <Moon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Configuration Panel */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                                Configuration
                            </h2>

                            {/* Usernames */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                                        GitHub Username
                                    </label>
                                    <input
                                        type="text"
                                        value={githubUsername}
                                        onChange={(e) =>
                                            setGithubUsername(e.target.value)
                                        }
                                        placeholder="octocat"
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                                        LeetCode Username
                                    </label>
                                    <input
                                        type="text"
                                        value={leetcodeUsername}
                                        onChange={(e) =>
                                            setLeetcodeUsername(e.target.value)
                                        }
                                        placeholder="user123"
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                {!isValid && (
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        At least one username is required
                                    </p>
                                )}
                            </div>

                            {/* Appearance */}
                            <div className="mt-6 space-y-4">
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                                    Appearance
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                                        Color Palette
                                    </label>
                                    <select
                                        value={palette}
                                        onChange={(e) =>
                                            setPalette(e.target.value as any)
                                        }
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="github">
                                            GitHub (Green)
                                        </option>
                                        <option value="blue">Blue</option>
                                        <option value="mono">Monochrome</option>
                                        <option value="sunset">
                                            Sunset (Yellow to Pink)
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                                        Cell Size: {cellSize}px
                                    </label>
                                    <input
                                        type="range"
                                        min="8"
                                        max="20"
                                        value={cellSize}
                                        onChange={(e) =>
                                            setCellSize(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showLegend}
                                            onChange={(e) =>
                                                setShowLegend(e.target.checked)
                                            }
                                            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                            Show Legend
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={compact}
                                            onChange={(e) =>
                                                setCompact(e.target.checked)
                                            }
                                            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                            Compact Mode
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={autoResize}
                                            onChange={(e) =>
                                                setAutoResize(e.target.checked)
                                            }
                                            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                            Auto-resize Height
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Embed Code */}
                        {isValid && (
                            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                        Embed Code
                                    </h2>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy Code
                                            </>
                                        )}
                                    </button>
                                </div>
                                <pre className="bg-zinc-100 dark:bg-zinc-950 p-4 rounded-lg overflow-x-auto text-xs font-mono text-zinc-800 dark:text-zinc-200">
                                    {generateIframeCode()}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Preview Panel */}
                    <div>
                        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 sticky top-8">
                            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                                Preview
                            </h2>

                            {isValid ? (
                                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                                    <iframe
                                        src={previewUrl}
                                        className="w-full"
                                        style={{
                                            height: compact ? "150px" : "200px",
                                            border: "none",
                                        }}
                                        title="Heatmap Preview"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-48 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                    <p className="text-zinc-500 dark:text-zinc-500">
                                        Enter at least one username to see
                                        preview
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
