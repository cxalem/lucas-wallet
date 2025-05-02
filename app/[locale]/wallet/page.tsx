import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import TransferModal from "@/components/transfer-modal";
import ContactsList from "@/components/contacts";
import { I18nProviderClient } from "@/locales/client";
import { getCurrentLocale } from "@/locales/server";
import { Suspense } from "react";
import { BalanceCardSkeleton } from "@/components/balance-card/balance-card-skeleton";
import { BalanceCard } from "@/components/balance-card";

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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="flex flex-col gap-2 max-h-80">
          <I18nProviderClient locale={locale}>
            <Suspense fallback={<BalanceCardSkeleton />}>
              <BalanceCard user_metadata={user_metadata} />
              <TransferModal />
            </Suspense>
          </I18nProviderClient>
        </div>
        <ContactsList />
      </section>

      <section className="h-3/4 mb-10">{/* <UserTabs /> */}</section>
    </main>
  );
}
