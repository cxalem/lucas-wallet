"use client";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { useI18n } from "@/locales/client";

export const SignOutButton = () => {
  const supabase = createClient();
  const t = useI18n();

  const signOut = async () => {
    await supabase.auth.signOut({ scope: "local" });
    redirect("/");
  };

  return (
    <Button
      className="bg-violet-600 hover:bg-violet-700 rounded-full px-10 py-2 text-blue-50 shadow-lg"
      onClick={signOut}
    >
      {t("signOut.button")}
    </Button>
  );
};
