import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { SignOutButton } from "@/components/sing-out-button";
import Link from "next/link";
import { I18nProviderClient } from "@/locales/client";
import { getCurrentLocale } from "@/locales/server";
import LanguageSwitcher from "@/components/language-switcher";
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
  description: "La billetera digital de toda Venezuela",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();
  return (
    <main
      className={`${geistSans.variable} ${geistMono.variable} relative z-50 dark:bg-gradient-to-b from-neutral-950 to-neutral-900 dark:text-blue-50 bg-neutral-100 text-foreground antialiased text-zinc-800 min-h-screen max-w-[100vw] overflow-x-hidden p-2 md:p-0`}
    >
      <div className="fixed inset-0 w-full h-full bg-repeat bg-noise opacity-10 bg-[length:350px] z-[-20]"></div>
      <ViewTransition>
        <nav className="flex justify-between items-center py-8 w-full max-w-6xl mx-auto z-50">
          <Link href="/wallet" className="font-bold text-lg">
            <h1 className="text-2xl/7 font-black uppercase text-center">
              Lucas <br /> Wallet
            </h1>
          </Link>
          <I18nProviderClient locale={locale}>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <SignOutButton />
            </div>
          </I18nProviderClient>
        </nav>
        <section className="max-w-6xl mx-auto">{children}</section>
      </ViewTransition>
    </main>
  );
}
