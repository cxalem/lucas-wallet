import Link from "next/link";
import LoginForm from "@/components/login-form";
import { getCurrentLocale, getI18n } from "@/locales/server";
import { I18nProviderClient } from "@/locales/client";

export default async function LoginPage() {
  const t = await getI18n();
  const locale = await getCurrentLocale();

  return (
    <div className="min-h-screen flex flex-col gap-4 items-center mt-40">
      <div className="bg-gradient-to-b from-red-600 via-yellow-600 to-purple-600 p-[1px] rounded-lg w-full max-w-xl shadow-2xl shadow-yellow-600/30 h-full">
        <I18nProviderClient locale={locale}>
          <LoginForm />
        </I18nProviderClient>
      </div>
      <p>
        <span className="mr-1">{t("login.noAccount")}</span>
        <Link href="/create-wallet">{t("login.createAccount")}</Link>
      </p>
    </div>
  );
}
