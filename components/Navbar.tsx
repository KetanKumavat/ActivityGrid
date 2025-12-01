"use client";
import { GithubIcon } from "lucide-react";
import { memo } from "react";
import { useTheme } from "next-themes";

export const Navbar = memo(function Navbar() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <nav className="px-4 pt-6 pb-4 z-50">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-md">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative inline-flex items-center px-2">
                                <a href="/">
                                    <svg
                                        className="absolute inset-0 w-full h-full text-neutral-200 dark:text-neutral-400/20"
                                        viewBox="0 0 120 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        preserveAspectRatio="none"
                                    >
                                        <line x1="90" x2="30" y1="4" y2="4" />
                                        <line x1="90" x2="30" y1="20" y2="20" />
                                        {/* <line x1="30" x2="30" y1="0" y2="24" /> */}
                                        <line x1="45" x2="45" y1="0" y2="24" />
                                        <line x1="60" x2="60" y1="0" y2="24" />
                                        <line x1="75" x2="75" y1="0" y2="24" />
                                        {/* <line x1="90" x2="90" y1="0" y2="24" /> */}
                                    </svg>
                                    <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 relative z-10 px-2 py-1">
                                        Activity Grid
                                    </h1>
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href="https://github.com/ketankumavat/ActivityGrid"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium text-xs hover:opacity-90 transition-opacity"
                                aria-label="Star on GitHub"
                            >
                                <GithubIcon className="w-4 h-4" />
                                <span>Star on GitHub</span>
                            </a>

                            <button
                                onClick={toggleTheme}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110"
                                aria-label="Toggle Theme"
                            >
                                <svg
                                    className="w-4 h-4 hidden dark:block text-zinc-700 dark:text-zinc-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                                <svg
                                    className="w-4 h-4 block dark:hidden text-zinc-700 dark:text-zinc-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
});
