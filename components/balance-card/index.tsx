"use client";

import { useState } from "react";
import type { UserMetadata } from "@supabase/supabase-js";
import { getUsdcBalance } from "../transfer-modal/actions";
import { useI18n } from "@/locales/client";
import { useQuery } from "@tanstack/react-query";
import { BalanceCardSkeleton } from "./balance-card-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Copy, Check, User } from "lucide-react";

// Assuming 1 USDC = $1
const USDC_TO_USD_RATE = 1;

function truncateAddress(address: string | undefined) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const BalanceCard = ({
  user_metadata,
}: {
  user_metadata: UserMetadata;
}) => {
  const t = useI18n();
  const [copied, setCopied] = useState(false);

  const walletAddress = user_metadata?.wallet_address;

  const {
    data: usdcBalance,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "usdcBalance",
      {
        walletAddress: walletAddress,
      },
    ],
    queryFn: getUsdcBalance,
    enabled: !!walletAddress,
    refetchInterval: 60000,
  });

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get initials for Avatar
  const name = user_metadata.user_name || user_metadata.first_name || "";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || <User className="h-5 w-5" />;

  if (isLoading) return <BalanceCardSkeleton />;

  // Improved Error Handling
  if (error || !usdcBalance) {
    return (
      <div className="space-y-4">
        <Card className="w-full bg-zinc-900 border-zinc-700">
          <CardContent className="py-3">
            <p className="text-red-500">
              {"Error loading balance:"}{" "}
              {error instanceof Error
                ? error.message
                : String(error || "Unknown error")}
            </p>
          </CardContent>
        </Card>
        {/* Optionally include a disabled TransferModal or Button here */}
        {/* <TransferModal disabled={true} /> */}
      </div>
    );
  }

  const numericBalance = usdcBalance ?? 0;
  const formattedUsdcBalance = numericBalance.toFixed(3);
  const usdValue = (numericBalance * USDC_TO_USD_RATE).toFixed(2);

  return (
    // Apply space-y-4 for layout between card and modal
    <div className="space-y-4">
      {/* Gradient wrapper */}
      <div className="bg-gradient-to-b flex flex-col from-red-600 via-yellow-600 to-purple-600 p-[1px] rounded-xl w-full shadow-2xl shadow-yellow-600/30 ">
        {/* Card now sits inside the gradient wrapper */}
        <Card className="w-full bg-zinc-800 border-zinc-700 rounded-xl">
          {" "}
          {/* Adjusted rounding */}
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 bg-zinc-800 border border-zinc-700">
                  {/* Use initials or fallback icon */}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  {/* Use "My Wallet" or keep dynamic name */}
                  <p className="font-medium text-xl text-white">
                    {"My Wallet"}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-zinc-400">
                      {truncateAddress(walletAddress)}
                    </p>
                    <button
                      onClick={copyToClipboard}
                      className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      aria-label={copied ? "Copied" : "Copy address"}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-xl text-white">${usdValue}</p>
                <p className="text-sm text-zinc-400">
                  {formattedUsdcBalance} {t("wallet.crypto") || "USDC"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
