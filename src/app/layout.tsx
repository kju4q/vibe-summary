import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SocialLinks from "./components/SocialLinks";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe Check - Get the Vibe of Any Content",
  description:
    "AI-powered one-sentence summaries of articles, tweets, and more",
  keywords:
    "AI summary, content summarization, article vibe, one-sentence summary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
          <main className="flex-grow py-12 px-4 relative">{children}</main>
          <footer className="py-6 text-center text-sm text-gray-500 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center">
                <SocialLinks />
                <p className="mt-4">
                  © {new Date().getFullYear()} Vibe Check | AI-Powered Summaries
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Instant one-sentence summaries for any content
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
