"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapDay {
    total: number;
    github: number;
    leetcode: number;
}

interface HeatmapGridProps {
    days: Record<string, HeatmapDay>;
    fromDate: string;
    toDate: string;
    palette?: "github" | "blue" | "mono" | "sunset";
    cellSize?: number;
    showLegend?: boolean;
    compact?: boolean;
}

const palettes = {
    github: {
        empty: "bg-zinc-100 dark:bg-zinc-800",
        1: "bg-green-200 dark:bg-green-900",
        2: "bg-green-400 dark:bg-green-700",
        3: "bg-green-600 dark:bg-green-500",
        4: "bg-green-800 dark:bg-green-300",
    },
    blue: {
        empty: "bg-zinc-100 dark:bg-zinc-800",
        1: "bg-blue-300 dark:bg-blue-900",
        2: "bg-blue-500 dark:bg-blue-700",
        3: "bg-blue-700 dark:bg-blue-500",
        4: "bg-blue-900 dark:bg-blue-300",
    },
    mono: {
        empty: "bg-zinc-100 dark:bg-zinc-800",
        1: "bg-zinc-300 dark:bg-zinc-700",
        2: "bg-zinc-500 dark:bg-zinc-500",
        3: "bg-zinc-700 dark:bg-zinc-300",
        4: "bg-zinc-900 dark:bg-zinc-100",
    },
    sunset: {
        empty: "bg-zinc-100 dark:bg-zinc-800",
        1: "bg-yellow-200 dark:bg-yellow-900",
        2: "bg-yellow-400 dark:bg-yellow-700",
        3: "bg-amber-600 dark:bg-amber-500",
        4: "bg-amber-800 dark:bg-amber-300",
    },
};

function getIntensityLevel(count: number): 1 | 2 | 3 | 4 {
    if (count === 0) return 1;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
}

function getMonthLabel(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short" });
}

export function HeatmapGrid({
    days,
    fromDate,
    toDate,
    palette = "github",
    cellSize = 12,
    showLegend = true,
    compact = false,
}: HeatmapGridProps) {
    const colors = palettes[palette];

    // Generate grid data organized by weeks
    const { weeks, monthLabels } = useMemo(() => {
        const start = new Date(fromDate);
        const end = new Date(toDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Use the earlier of end date or today
        const actualEnd = end > today ? today : end;

        // Start from the Sunday before the start date
        const gridStart = new Date(start);
        gridStart.setDate(start.getDate() - start.getDay());

        const weeks: Array<Array<{ date: string; count: number } | null>> = [];
        let currentWeek: Array<{ date: string; count: number } | null> = [];
        const monthLabels: Array<{ week: number; label: string }> = [];

        let weekIndex = 0;
        let lastMonth = -1;

        for (
            let d = new Date(gridStart);
            d <= actualEnd;
            d.setDate(d.getDate() + 1)
        ) {
            const dateStr = d.toISOString().split("T")[0];
            const dayOfWeek = d.getDay();

            // Check if we're starting a new month - only add if it's at the beginning of a week OR first occurrence
            const currentMonth = d.getMonth();
            if (currentMonth !== lastMonth) {
                // Only add month label if we're at the start of a week (Sunday) for cleaner alignment
                if (dayOfWeek === 0 || monthLabels.length === 0) {
                    monthLabels.push({
                        week: weekIndex,
                        label: getMonthLabel(d),
                    });
                    lastMonth = currentMonth;
                }
            }

            // If this date is before start or after actualEnd, show it but grayed out
            const isInRange = d >= start && d <= actualEnd;
            const count = isInRange ? days[dateStr]?.total || 0 : 0;

            currentWeek.push(isInRange ? { date: dateStr, count } : null);

            if (dayOfWeek === 6) {
                weeks.push(currentWeek);
                currentWeek = [];
                weekIndex++;
            }
        }

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        return { weeks, monthLabels };
    }, [days, fromDate, toDate]);

    const dayLabels = compact ? [] : ["Mon", "Wed", "Fri"];

    return (
        <TooltipProvider delayDuration={0}>
            <div className="relative w-full">
                <div className="flex gap-2">
                    {/* Day labels */}
                    {!compact && (
                        <div className="flex flex-col justify-around text-xs text-zinc-600 dark:text-zinc-400 pr-2">
                            {dayLabels.map((label, i) => (
                                <div
                                    key={i}
                                    style={{ height: cellSize }}
                                    className="flex items-center"
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 overflow-x-auto">
                        {/* Month labels */}
                        {!compact && (
                            <div
                                className="relative mb-1 text-xs text-zinc-600 dark:text-zinc-400"
                                style={{ height: "16px" }}
                            >
                                {monthLabels.map(({ week, label }) => (
                                    <div
                                        key={week}
                                        className="absolute"
                                        style={{
                                            left: `${week * (cellSize + 3)}px`,
                                        }}
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Heatmap grid */}
                        <div className="flex gap-[3px]">
                            {weeks.map((week, weekIndex) => (
                                <div
                                    key={weekIndex}
                                    className="flex flex-col gap-[3px]"
                                >
                                    {week.map((day, dayIndex) => {
                                        if (!day) {
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    style={{
                                                        width: cellSize,
                                                        height: cellSize,
                                                    }}
                                                    className="rounded-sm"
                                                />
                                            );
                                        }

                                        const { date, count } = day;
                                        const dayData = days[date] || {
                                            total: 0,
                                            github: 0,
                                            leetcode: 0,
                                        };
                                        const level =
                                            count === 0
                                                ? "empty"
                                                : getIntensityLevel(count);
                                        const colorClass = colors[level];

                                        return (
                                            <Tooltip key={dayIndex}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        style={{
                                                            width: cellSize,
                                                            height: cellSize,
                                                        }}
                                                        className={cn(
                                                            "rounded-sm transition-colors duration-150 hover:ring-2 hover:ring-zinc-400 dark:hover:ring-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer",
                                                            colorClass
                                                        )}
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-label={`${date}: ${count} contributions`}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="text-xs">
                                                        <div className="font-semibold mb-1">
                                                            {new Date(
                                                                date
                                                            ).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                }
                                                            )}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            {dayData.github >
                                                                0 && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-neutral-200 dark:text-neutral-600">
                                                                        GitHub:
                                                                    </span>
                                                                    <span className="font-medium text-neutral-100 dark:text-neutral-700">
                                                                        {
                                                                            dayData.github
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {dayData.leetcode >
                                                                0 && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-neutral-200 dark:text-neutral-600">
                                                                        LeetCode:
                                                                    </span>
                                                                    <span className="font-medium text-neutral-100 dark:text-neutral-700">
                                                                        {
                                                                            dayData.leetcode
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 font-semibold">
                                                                <span className="text-neutral-200 dark:text-neutral-600">
                                                                    Total:
                                                                </span>
                                                                <span className="text-neutral-100 dark:text-neutral-700">
                                                                    {
                                                                        dayData.total
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {showLegend && (
                    <div className="flex items-center gap-2 mt-4 text-xs text-zinc-600 dark:text-zinc-400">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div
                                className={cn(
                                    "w-3 h-3 rounded-sm",
                                    colors.empty
                                )}
                            />
                            <div
                                className={cn("w-3 h-3 rounded-sm", colors[1])}
                            />
                            <div
                                className={cn("w-3 h-3 rounded-sm", colors[2])}
                            />
                            <div
                                className={cn("w-3 h-3 rounded-sm", colors[3])}
                            />
                            <div
                                className={cn("w-3 h-3 rounded-sm", colors[4])}
                            />
                        </div>
                        <span>More</span>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
