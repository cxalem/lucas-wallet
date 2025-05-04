import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { SignOutButton } from "@/components/sing-out-button";
import Link from "next/link";
import { I18nProviderClient } from "@/locales/client";
import { getCurrentLocale } from "@/locales/server";
import { unstable_ViewTransition as ViewTransition } from "react";
import ParticleBackground from "@/components/particle-background";
import { SidebarNav } from "@/components/sidebar-nav";
import dynamic from "next/dynamic";

const LanguageSwitcher = dynamic(
  () => import("@/components/language-switcher")
);

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
    <I18nProviderClient locale={locale}>
      <main
        className={`${geistSans.variable} ${geistMono.variable} relative z-50 dark:bg-gradient-to-b from-neutral-950 to-neutral-900 dark:text-blue-50 bg-neutral-100 text-foreground antialiased text-zinc-800 max-w-[100vw] overflow-x-hidden`}
      >
        <div className="fixed inset-0 w-full h-full bg-repeat bg-noise opacity-10 bg-[length:350px] z-[-20]"></div>
        <ViewTransition>
          <div className="flex min-h-screen">
            <aside className="w-16 md:w-60 flex flex-col justify-between p-3 md:p-6 bg-neutral-800 border-r border-neutral-50/10 transition-all duration-300">
              <div>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                  <Link href="/wallet" className="font-bold text-lg">
                    <h1 className="text-2xl/7 font-black uppercase">
                      <span className="hidden md:inline">Lucas Wallet</span>
                      <span className="md:hidden">LW</span>
                    </h1>
                  </Link>
                  <LanguageSwitcher />
                </div>
                <SidebarNav />
              </div>
              <div>
                <SignOutButton />
              </div>
            </aside>
            <div className="flex-1 relative p-8">
              <ParticleBackground />
              <section className="h-full max-w-6xl mx-auto">{children}</section>
            </div>
          </div>
        </ViewTransition>
      </main>
    </I18nProviderClient>
  );
}
