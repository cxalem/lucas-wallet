import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import { BalanceCardSkeleton } from "@/components/balance-card/balance-card-skeleton";
import { BalanceCard } from "@/components/balance-card";
import Chat from "@/components/chat";

export default async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/create-wallet");
  }
  const { user_metadata } = data.user;
  return (
    <main className="relative">
      <section className="flex justify-center min-h-[90vh]">
        <div className="flex flex-col gap-4 w-full max-w-3xl mt-4">
          <Suspense fallback={<BalanceCardSkeleton />}>
            <div className="flex flex-col gap-4 justify-between items-stretch h-full">
              <div className="flex flex-col gap-4">
                <BalanceCard user_metadata={user_metadata} />
              </div>
              <Chat />
            </div>
          </Suspense>
        </div>
      </section>
    </main>
  );
}
