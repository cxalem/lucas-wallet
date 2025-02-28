import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/navbar";

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
      className={`${geistSans.variable} ${geistMono.variable} dark:bg-neutral-900 bg-[url('/background-image.webp')] bg-fixed bg-no-repeat bg-cover dark:text-blue-50 bg-neutral-100 text-foreground antialiased text-zinc-800 min-h-screen`}
    >
      <Navbar />
      <div className="fixed inset-0 w-full h-full bg-repeat bg-noise opacity-10 bg-[length:350px] z-[-20]"></div>
      {children}
    </main>
  );
}
