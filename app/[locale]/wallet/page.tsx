import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { I18nProviderClient } from "@/locales/client";
import { getCurrentLocale } from "@/locales/server";
import { Suspense } from "react";
import { BalanceCardSkeleton } from "@/components/balance-card/balance-card-skeleton";
import { BalanceCard } from "@/components/balance-card";
import dynamic from "next/dynamic";

const TransferModal = dynamic(() => import("@/components/transfer-modal"));

export default async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/create-wallet");
  }
  const { user_metadata } = data.user;
  const locale = await getCurrentLocale();
  return (
    <main className="relative">
      <section className="flex justify-center">
        <div className="flex flex-col gap-2 max-h-80 w-full max-w-3xl mt-4">
          <I18nProviderClient locale={locale}>
            <Suspense fallback={<BalanceCardSkeleton />}>
              <BalanceCard user_metadata={user_metadata} />
              <TransferModal />
            </Suspense>
          </I18nProviderClient>
        </div>
      </section>
    </main>
  );
}
