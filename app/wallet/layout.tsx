import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { SignOutButton } from "@/components/sing-out-button";
import Link from "next/link";

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
    <main
      className={`${geistSans.variable} ${geistMono.variable} antialiased w-full max-w-6xl mx-auto`}
    >
      <nav className="flex justify-between items-center p-4 mx-auto">
        <Link href="/wallet" className="font-bold text-lg">
          Lucas Wallet
        </Link>
        <SignOutButton />
      </nav>
      {children}
    </main>
  );
}
