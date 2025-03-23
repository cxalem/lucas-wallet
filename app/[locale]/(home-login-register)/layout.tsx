import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
import Navbar from "@/components/navbar";
import { unstable_ViewTransition as ViewTransition } from "react";

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
  description: "The easiest AI wallet to use!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}
    >
      <div className="fixed inset-0 w-full h-full bg-repeat bg-noise opacity-10 bg-[length:250px] -z-10"></div>
      <ViewTransition>
        <Navbar />
        {children}
      </ViewTransition>
    </main>
  );
}
