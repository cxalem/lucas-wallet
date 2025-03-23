import { Button } from "@/components/ui/button";
// import { signup } from "./actions";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getI18n } from "@/locales/server";

export default async function CreateWalletPage() {
  const t = await getI18n();

  return (
    <div className="min-h-screen flex flex-col gap-4 items-center mt-16">
      <div className="bg-gradient-to-b from-red-600 via-yellow-600 to-purple-600 p-[1px] rounded-lg w-full max-w-xl shadow-2xl shadow-yellow-600/30 ">
        <form className="flex flex-col gap-6 items-center backdrop-blur-sm justify-center mx-auto bg-neutral-800 px-10 md:px-16 py-16 rounded-lg w-full max-w-xl">
          <div className="flex flex-col gap-2 items-center">
            <Link href="/" className="text-lg">
              <h1 className="text-4xl/9 font-black uppercase text-center">
                {t("createWallet.title")}
              </h1>
            </Link>
            <p className="text-center text-sm text-blue-50/70">
              {t("createWallet.description")}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-sm">
            <label htmlFor="email">{t("createWallet.email.label")}</label>
            <Input
              className="bg-neutral-700 border-none w-full"
              placeholder={t("createWallet.email.placeholder")}
              id="email"
              name="email"
              type="email"
              required
            />
            <label htmlFor="password">{t("createWallet.password.label")}</label>
            <Input
              className="bg-neutral-700 border-none w-full"
              placeholder={t("createWallet.password.placeholder")}
              id="password"
              name="password"
              type="password"
              required
            />
            <label htmlFor="user_name">
              {t("createWallet.username.label")}
            </label>
            <Input
              className="bg-neutral-700 border-none w-full"
              placeholder={t("createWallet.username.placeholder")}
              id="user_name"
              name="user_name"
              type="text"
              required
            />
          </div>
          <Button
            className="bg-violet-600 hover:bg-violet-700 w-full text-blue-50 rounded-full max-w-sm"
            formAction={() => {
              console.log("Not working yet")
            }}
          >
            {t("createWallet.button")}
          </Button>
        </form>
      </div>
      <p>
        <span className="mr-1">{t("createWallet.haveAccount")}</span>
        <Link href="/login">{t("createWallet.login")}</Link>
      </p>
    </div>
  );
}
