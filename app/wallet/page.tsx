import { redirect } from "next/navigation";
import { client } from "@/wallet.config";
import { createClient } from "@/utils/supabase/server";
import { formatEther } from "viem";
import TransferModal from "@/components/transfer-modal";

export default async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/create-wallet");
  }
  const { user_metadata } = data.user;

  const balance = await client.getBalance({
    address: user_metadata.wallet_address,
  });

  // limit decimasl to 3

  const formattedBalance = formatEther(balance);

  return (
    <main className="grid grid-cols-2 gap-4">
      <div className="p-4 space-y-4">
        <h3 className="text-4xl font-bold">
          Bienvenido,{" "}
          <span className="text-sky-500">{user_metadata.first_name}</span>! Aquí
          podrás ver tus Lucas
        </h3>
        <section className="bg-white space-y-4 rounded-lg py-4 px-6 border border-neutral-300">
          <h3 className="text-lg flex flex-col gap-2 font-bold">Saldo</h3>
          <div className="flex justify-between place-items-end">
            <p className="text-4xl font-semibold">
              {formattedBalance.slice(0, 4)}{" "}
              <span className="text-sky-500">USD</span>
            </p>
            <p className="text-neutral-900 font-medium text-xl text-opacity-50">
              {formattedBalance.slice(0, 4)} ETH
            </p>
          </div>
        </section>
        <TransferModal />
      </div>
    </main>
  );
}
