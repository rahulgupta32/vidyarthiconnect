import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VidyarthiConnect | Secure AI-Powered Study Abroad Platform",
  description: "VidyarthiConnect digitizes and secures the traditional study abroad experience for Nepali students. Discover universities, manage documents, get AI recommendations, and track applications.",
  keywords: ["study abroad", "study abroad Nepal", "AI consultancy", "study abroad AI", "Nepal NOC", "university recommendations"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
