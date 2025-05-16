import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getI18n } from "@/locales/server";
import Hero from "@/components/hero";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const t = await getI18n();

  if (data?.user) {
    redirect("/wallet");
  }

  return (
    <Hero title={t("home.title")} subtitle={t("home.subtitle")} />
  );
}
