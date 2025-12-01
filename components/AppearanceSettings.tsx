import { PaletteType } from "@/lib/types";
import { memo } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AppearanceSettingsProps {
    palette: PaletteType;
    cellSize: number;
    showLegend: boolean;
    compact: boolean;
    autoResize: boolean;
    onPaletteChange: (value: PaletteType) => void;
    onCellSizeChange: (value: number) => void;
    onShowLegendChange: (value: boolean) => void;
    onCompactChange: (value: boolean) => void;
    onAutoResizeChange: (value: boolean) => void;
}

export const AppearanceSettings = memo(function AppearanceSettings({
    palette,
    cellSize,
    showLegend,
    compact,
    autoResize,
    onPaletteChange,
    onCellSizeChange,
    onShowLegendChange,
    onCompactChange,
    onAutoResizeChange,
}: AppearanceSettingsProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
                Appearance
            </h2>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                        Theme
                    </label>

                    <Select value={palette} onValueChange={onPaletteChange}>
                        <SelectTrigger className="w-full px-3 py-1.5 text-sm rounded-lg border border-input bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-ring focus:border-border transition-all cursor-pointer">
                            <SelectValue placeholder="Github Green" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="github">Github Green</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="mono">Monochrome</SelectItem>
                            <SelectItem value="sunset">Sunset</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                        Cell Size: {cellSize}px
                    </label>
                    <input
                        type="range"
                        min="8"
                        max="20"
                        value={cellSize}
                        onChange={(e) =>
                            onCellSizeChange(parseInt(e.target.value))
                        }
                        className="w-full accent-primary cursor-pointer"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={showLegend}
                            onChange={(e) =>
                                onShowLegendChange(e.target.checked)
                            }
                            className="w-3.5 h-3.5 rounded border-input text-primary focus:ring-ring focus:ring-offset-0"
                        />
                        <span className="text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                            Show Legend
                        </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={compact}
                            onChange={(e) => onCompactChange(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-input text-primary focus:ring-ring focus:ring-offset-0"
                        />
                        <span className="text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                            Compact Mode
                        </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={autoResize}
                            onChange={(e) =>
                                onAutoResizeChange(e.target.checked)
                            }
                            className="w-3.5 h-3.5 rounded border-input text-primary focus:ring-ring focus:ring-offset-0"
                        />
                        <span className="text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                            Auto-resize Height
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
});
