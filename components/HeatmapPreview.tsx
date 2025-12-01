import { HeatmapGrid } from "./HeatmapGrid";
import { HeatmapSkeleton } from "./HeatmapSkeleton";
import { HeatmapResponse, PaletteType } from "@/lib/types";
import { memo } from "react";

interface HeatmapPreviewProps {
    isValid: boolean;
    loading: boolean;
    error: string | null;
    data: HeatmapResponse | null;
    palette: PaletteType;
    cellSize: number;
    showLegend: boolean;
    compact: boolean;
}

export const HeatmapPreview = memo(function HeatmapPreview({
    isValid,
    loading,
    error,
    data,
    palette,
    cellSize,
    showLegend,
    compact,
}: HeatmapPreviewProps) {
    const hasPartialErrors =
        data?.meta.errors &&
        (data.meta.errors.github || data.meta.errors.leetcode);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
                Live Preview
            </h2>

            {!isValid ? (
                <div className="flex flex-col items-center justify-center h-56 bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                    <svg
                        className="w-14 h-14 text-zinc-400 dark:text-zinc-600 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                        Enter at least one username
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                        Your heatmap will appear here
                    </p>
                </div>
            ) : loading ? (
                <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                    <HeatmapSkeleton cellSize={cellSize} compact={compact} />
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-56 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-center px-4">
                        <p className="font-semibold text-sm text-red-900 dark:text-red-200 mb-1">
                            Error
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300">
                            {error}
                        </p>
                    </div>
                </div>
            ) : data ? (
                <div>
                    {hasPartialErrors && (
                        <div className="mb-3 p-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs">
                            <div className="font-medium text-yellow-900 dark:text-yellow-200 mb-0.5">
                                Partial data
                            </div>
                            {data.meta.errors?.github && (
                                <div className="text-yellow-800 dark:text-yellow-300 text-[10px]">
                                    GitHub: {data.meta.errors.github}
                                </div>
                            )}
                            {data.meta.errors?.leetcode && (
                                <div className="text-yellow-800 dark:text-yellow-300 text-[10px]">
                                    LeetCode: {data.meta.errors.leetcode}
                                </div>
                            )}
                        </div>
                    )}

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
            ) : null}
        </div>
    );
});
