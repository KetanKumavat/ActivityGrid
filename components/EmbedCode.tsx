import { Copy, Check } from "lucide-react";
import { memo } from "react";

interface EmbedCodeProps {
    embedCode: string;
    copied: boolean;
    onCopy: () => void;
}

export const EmbedCode = memo(function EmbedCode({
    embedCode,
    copied,
    onCopy,
}: EmbedCodeProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Embed Code
                </h2>
                <button
                    onClick={onCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all text-xs font-medium shadow-sm hover:shadow-md"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-lg overflow-x-auto text-[11px] font-mono text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 text-ellipsis whitespace-pre-wrap">
                {embedCode}
            </pre>
        </div>
    );
});
