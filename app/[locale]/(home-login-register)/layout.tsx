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
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen relative overflow-hidden`}
    >
      {/* SVG Curved Grid Background - denser, smaller grid */}
      <svg
        className="absolute inset-0 w-full h-full -z-10"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* More vertical grid lines, closer together */}
        {[...Array(25)].map((_, i) => {
          const x = 60 * i;
          return (
            <path
              key={`v-${i}`}
              d={`M${x},800 Q${x - 360},400 ${x},0`}
              stroke="#171717"
              strokeWidth="1.2"
            />
          );
        })}
        {/* More horizontal grid lines, closer together */}
        {[...Array(13)].map((_, i) => {
          const y = 60 * i;
          return (
            <path
              key={`h-${i}`}
              d={`M0,${800 - y} Q720,${800 - y - 200} 1440,${800 - y}`}
              stroke="#171717"
              strokeWidth="1.2"
            />
          );
        })}
      </svg>
      <div className="fixed inset-0 w-full h-full bg-repeat bg-noise opacity-10 bg-[length:250px] pointer-events-none -z-10"></div>
      <ViewTransition>
        <Navbar />
        {children}
      </ViewTransition>
    </main>
  );
}
