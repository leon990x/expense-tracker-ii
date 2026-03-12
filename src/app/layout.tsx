import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppNavigation from "@/components/AppNavigation";
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
  title: "DollarVis",
  description: "Expense tracker dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-8">
          <header className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 sm:px-6">
            <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900">
              Dollar
              <span className="font-extrabold italic text-emerald-900">V</span>
              is
            </h1>
            <AppNavigation />
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
