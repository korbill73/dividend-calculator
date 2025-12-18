import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FinDash - Personal Finance",
  description: "Personal Dividend & Asset Management System",
};

import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen bg-background text-foreground overflow-hidden`}
      >
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
