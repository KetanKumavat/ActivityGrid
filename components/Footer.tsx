"use client";

import Link from "next/link";
import { GitHub, Twitter, Linkedin } from "./ui/social-icons";
import { memo } from "react";

export const Footer = memo(function Footer() {
    return (
        <footer className="px-4 pt-8 pb-6 relative">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white/5 dark:bg-zinc-900/5 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-md">
                    <div className="px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Logo/Brand */}
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

                        {/* Links */}
                        <div className="flex items-center gap-6 text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">
                                Made with ❤️ by{" "}
                                <Link
                                    href="https://ketankumavat.me"
                                    target="_blank"
                                    className="text-zinc-900 dark:text-zinc-100 transition-colors underline underline-offset-4 decoration-2 font-medium"
                                >
                                    Ketan
                                </Link>
                            </span>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-6">
                            <Link
                                href="https://github.com/KetanKumavat/ActivityGrid"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-300"
                                aria-label="GitHub"
                            >
                                <GitHub className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                            </Link>

                            <Link
                                href="https://x.com/KetanK004"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-300"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                            </Link>

                            <Link
                                href="https://linkedin.com/in/ketankumavat"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-300"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
});
