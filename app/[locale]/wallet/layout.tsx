import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { SignOutButton } from "@/components/sing-out-button";
import Link from "next/link";
import { I18nProviderClient } from "@/locales/client";
import { getCurrentLocale } from "@/locales/server";
import LanguageSwitcher from "@/components/language-switcher";

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
      className={`${geistSans.variable} ${geistMono.variable} relative z-50 dark:bg-neutral-950 dark:text-blue-50 bg-neutral-100 text-foreground antialiased text-zinc-800 min-h-screen max-w-[100vw] overflow-x-hidden p-2 md:p-0`}
    >
      <div className="fixed inset-0 w-full h-full bg-repeat bg-noise opacity-10 bg-[length:350px] z-[-20]"></div>
      <div className="before:content-[''] before:absolute before:w-[200px] before:h-[200px] md:before:w-[500px] md:before:h-[500px] before:rounded-full before:blur-[100px] before:-left-[100px] before:top-[30px] before:bg-rose-300 before:-z-30 before:opacity-30"></div>
      <div className="hidden lg:block before:content-[''] before:absolute before:w-[500px] before:h-[500px] before:rounded-full before:blur-[100px] before:right-[900px] before:top-[30px] before:bg-teal-700 before:-z-30 before:opacity-50"></div>

      <div className="before:content-[''] before:absolute before:w-[200px] before:h-[200px] md:before:w-[500px] md:before:h-[500px] before:rounded-full before:blur-[100px] before:right-[50px] before:bottom-[30px] md:before:-right-[100px] md:before:bottom-[30px] before:bg-teal-300 md:before:bg-rose-300 before:-z-30 before:opacity-40 md:before:opacity-30"></div>
      <div className="hidden lg:block before:content-[''] before:absolute before:w-[500px] before:h-[500px] before:rounded-full before:blur-[100px] before:left-[900px] before:bottom-[30px] before:bg-teal-700 before:-z-30 before:opacity-40"></div>

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
    </main>
  );
}
