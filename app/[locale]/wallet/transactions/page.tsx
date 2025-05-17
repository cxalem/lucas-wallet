import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import TransactionTable from "@/components/transaction-table";

export default async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/create-wallet");
  }

  const address = data.user.user_metadata.wallet_address;

  const { data: transactionsSent, error: transactionsError } = await supabase
    .from("transactions")
    .select("*")
    .eq("from->>wallet_address", address);

  const { data: transactionsReceived, error: transactionsReceivedError } = await supabase
    .from("transactions")
    .select("*")
    .eq("to->>wallet_address", address);

  if (transactionsError || transactionsReceivedError) {
    console.error(transactionsError || transactionsReceivedError);
  }

  return (
    <main className="relative">
      <TransactionTable
        transactionsSent={(transactionsSent || []).map((tx) => ({
          ...tx,
          transaction_type: "send",
        }))}
        transactionsReceived={(transactionsReceived || []).map((tx) => ({
          ...tx,
          transaction_type: "receive",
        }))}
      />
    </main>
  );
}
