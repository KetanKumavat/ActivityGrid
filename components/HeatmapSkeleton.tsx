import { Skeleton } from "@/components/ui/skeleton";
import { memo } from "react";

interface HeatmapSkeletonProps {
    cellSize?: number;
    compact?: boolean;
}

export const HeatmapSkeleton = memo(function HeatmapSkeleton({
    cellSize = 12,
    compact = false,
}: HeatmapSkeletonProps) {
    const weeks = 53;
    const days = compact ? 3 : 7;
    const gap = 2;

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {/* Day labels skeleton */}
                <div
                    className="flex flex-col gap-[2px] justify-around"
                    style={{ height: `${days * (cellSize + gap)}px` }}
                >
                    {Array.from({ length: days }).map((_, i) => (
                        <Skeleton key={i} className="h-3 w-6 rounded" />
                    ))}
                </div>

                {/* Grid skeleton */}
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-[2px]">
                        {Array.from({ length: weeks }).map((_, weekIndex) => (
                            <div
                                key={weekIndex}
                                className="flex flex-col gap-[2px]"
                            >
                                {Array.from({ length: days }).map(
                                    (_, dayIndex) => (
                                        <Skeleton
                                            key={dayIndex}
                                            className="rounded-sm"
                                            style={{
                                                width: `${cellSize}px`,
                                                height: `${cellSize}px`,
                                            }}
                                        />
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend skeleton */}
            <div className="flex items-center justify-end gap-2 text-xs">
                <Skeleton className="h-3 w-12 rounded" />
                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="rounded-sm"
                            style={{
                                width: `${cellSize}px`,
                                height: `${cellSize}px`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});
