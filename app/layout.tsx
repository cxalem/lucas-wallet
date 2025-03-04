import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lucas Wallet",
  description: "La billetera digital de toda Venezuela",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="relative dark">
      <Providers>
        <body
          className={`${geistSans.variable} ${geistMono.variable} dark:text-blue-50 bg-neutral-100 text-foreground antialiased text-zinc-800`}
        >
          {children}
        </body>
      </Providers>
    </html>
  );
}
