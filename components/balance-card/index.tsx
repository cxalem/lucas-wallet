"use client";

import type { UserMetadata } from "@supabase/supabase-js";
import { getUsdcBalance } from "../transfer-modal/actions";
import { formatUsdcBalance } from "@/lib/utils";
import { useI18n } from "@/locales/client";
import { useQuery } from "@tanstack/react-query";
import { BalanceCardSkeleton } from "./balance-card-skeleton";

export const BalanceCard = ({
  user_metadata,
}: {
  user_metadata: UserMetadata;
}) => {
  const t = useI18n();

  const {
    data: usdcBalance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["usdcBalance", user_metadata.wallet_address],
    queryFn: getUsdcBalance,
    refetchInterval: 30000,
  });

  if (isLoading) return <BalanceCardSkeleton />;
  if (error) return <div>Error al cargar el balance</div>;

  const nameOrUsername = user_metadata.user_name || user_metadata.first_name;

  return (
    <div className="bg-gradient-to-b flex flex-col from-red-600 h-full via-yellow-600 to-purple-600 p-[1px] rounded-xl w-full shadow-2xl shadow-yellow-600/30 ">
      <div className="p-6 flex flex-col justify-between bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl h-full">
        <div className="font-bold">
          <p className="text-3xl">
            {t("wallet.welcome", { name: nameOrUsername })}
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
              {formatUsdcBalance(usdcBalance)}{" "}
              <span className="font-thin text-xl opacity-50">
                {t("wallet.currency")}
              </span>
            </p>
            <p className="text-blue-50 font-medium text-xl text-opacity-50">
              {usdcBalance} {t("wallet.crypto")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
