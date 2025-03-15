"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";

export default function LoginButton({
  type = "link",
  handleLogin,
  isLoading,
}: {
  type?: "login" | "link";
  handleLogin?: (formData: FormData) => Promise<void>;
  isLoading?: boolean;
}) {
  const t = useI18n();

  if (type === "login") {
    return (
      <Button
        formAction={handleLogin}
        className="bg-violet-600 px-10 py-2 rounded-full text-zinc-50 font-medium hover:bg-violet-700 w-full"
      >
        {isLoading ? t("login.button.loading") : t("login.button.login")}
      </Button>
    );
  }

  return (
    <Link href="/login">
      <Button className="bg-violet-600 px-10 py-2 rounded-full text-zinc-50 font-medium hover:bg-violet-700 shadow-lg">
        {t("login.button.sendMoney")}
      </Button>
    </Link>
  );
}
