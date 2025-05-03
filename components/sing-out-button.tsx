"use client";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { useI18n } from "@/locales/client";
import { LogOut } from "lucide-react";

export const SignOutButton = () => {
  const supabase = createClient();
  const t = useI18n();

  const signOut = async () => {
    await supabase.auth.signOut({ scope: "local" });
    redirect("/");
  };

  return (
    <Button
      className="bg-violet-600 hover:bg-violet-700 w-full cursor-pointer rounded-full px-3 md:px-10 py-2 text-blue-50 shadow-lg"
      onClick={signOut}
    >
      <LogOut className="h-5 w-5 md:mr-2" />
      <span className="hidden md:inline">{t("signOut.button")}</span>
    </Button>
  );
};
