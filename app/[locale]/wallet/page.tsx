import { redirect } from "next/navigation";
import { client } from "@/wallet.config";
import { createClient } from "@/utils/supabase/server";
import { formatEther } from "viem";
import TransferModal from "@/components/transfer-modal";
import ContactsList from "@/components/contacts";
import { getI18n } from "@/locales/server";

export default async function PrivatePage() {
  const supabase = await createClient();
  const t = await getI18n();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/create-wallet");
  }
  const { user_metadata } = data.user;

  const balance = await client.getBalance({
    address: user_metadata.wallet_address,
  });

  const formattedBalance = formatEther(balance);

  return (
    <main className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="flex flex-col gap-2 max-h-80">
        <div className="bg-gradient-to-b flex flex-col from-red-600 h-full via-yellow-600 to-purple-600 p-[1px] rounded-xl w-full shadow-2xl shadow-yellow-600/30 ">
          <div className="p-6 flex flex-col justify-between bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl h-full">
            <div className="font-bold">
              <p className="text-3xl">
                {t("wallet.welcome", { name: user_metadata.first_name })}
                <br />
              </p>
              <span className="text-blue-50 text-opacity-70 font-thin text-md">
                {t("wallet.balanceDescription")}
              </span>
            </div>
            <section className="space-y-1 rounded-lg">
              <h3 className="text-blue-50 text-lg flex flex-col gap-2 font-semibold text-opacity-50">
                {t("wallet.balanceLabel")}
              </h3>
              <div className="flex justify-between place-items-end">
                <p className="text-4xl font-semibold">
                  ${formattedBalance.slice(0, 4)}{" "}
                  <span className="font-thin text-xl opacity-50">
                    {t("wallet.currency")}
                  </span>
                </p>
                <p className="text-blue-50 font-medium text-xl text-opacity-50">
                  {formattedBalance.slice(0, 4)} {t("wallet.crypto")}
                </p>
              </div>
            </section>
          </div>
        </div>
        <TransferModal />
      </div>
      <ContactsList />
    </main>
  );
}
