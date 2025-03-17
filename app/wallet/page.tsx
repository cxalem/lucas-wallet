import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import TransferModal from "@/components/transfer-modal";
import ContactsList from "@/components/contacts";

import { BalanceCard } from "@/components/balance-card";
export default async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/create-wallet");
  }
  const { user_metadata } = data.user;

  return (
    <main className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="flex flex-col gap-2 max-h-80">
        <BalanceCard user_metadata={user_metadata} />
        <TransferModal />
      </div>
      <ContactsList />
    </main>
  );
}
