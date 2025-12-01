import type { Metadata } from "next";
import "./globals.css";
import ThemeProviderClient from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
    title: "Activity Grid - GitHub & LeetCode Heatmap",
    description:
        "Generate a unified GitHub and LeetCode activity heatmap, customize its appearance, and embed it directly into your developer portfolio or personal website.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className="transition-colors duration-200"
        >
            <body className={` ${inter.className} antialiased`}>
                <ThemeProviderClient>
                    <Navbar />
                    {children}
                </ThemeProviderClient>
            </body>
        </html>
    );
}
