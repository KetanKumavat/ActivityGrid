export interface HeatmapDay {
    total: number;
    github: number;
    leetcode: number;
}

export interface HeatmapResponse {
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

export type PaletteType = "github" | "blue" | "mono" | "sunset";
