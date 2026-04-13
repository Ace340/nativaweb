import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumen Artisan Landing | High-converting showcase",
  description:
    "Dual-product ecommerce-style landing page built with Next.js 15, Tailwind CSS, Framer Motion, and shadcn/ui components."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[var(--page-bg)]`}
    >
      <body className="min-h-full text-[var(--text-primary)]">{children}</body>
    </html>
  );
}
