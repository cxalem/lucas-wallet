import Link from "next/link";
import LoginButton from "./login-button";
import LanguageSwitcher from "./language-switcher";
import { getCurrentLocale } from "@/locales/server";
import { I18nProviderClient } from "@/locales/client";

export default async function Navbar() {
  const locale = await getCurrentLocale();

  return (
    <nav className="flex justify-between items-center px-2 md:px-0 py-8 w-full max-w-6xl mx-auto z-50">
      <Link href="/" className="font-bold text-lg">
        <h1 className="text-2xl/7 font-black uppercase text-center">
          Lucas <br /> Wallet
        </h1>
      </Link>
      <I18nProviderClient locale={locale}>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <LoginButton />
        </div>
      </I18nProviderClient>
    </nav>
  );
}
