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
      className={`${geistSans.variable} ${geistMono.variable} dark:bg-neutral-900 bg-fixed bg-no-repeat bg-cover dark:text-blue-50 bg-neutral-100 text-foreground antialiased text-zinc-800 min-h-screen`}
    >
      <nav className="flex justify-between items-center py-8 w-full max-w-6xl mx-auto">
        <Link href="/" className="font-bold text-lg">
          <h1 className="text-2xl/7 font-black uppercase text-center">
            Lucas <br /> Wallet
          </h1>
        </Link>
        <SignOutButton />
      </nav>
      <section className="max-w-6xl mx-auto">{children}</section>
    </main>
  );
}
