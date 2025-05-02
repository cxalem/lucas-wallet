"use client";

import { transferFormSchema } from "@/utils/schemas";
import { Button } from "../ui/button";
import { z } from "zod";
import { useI18n } from "@/locales/client";
import { PublicKey } from "@solana/web3.js";
import { formatUsdcBalance } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface TransferModalSecondStepProps {
  transferData: z.infer<typeof transferFormSchema>;
  recipient: {
    wallet_address: PublicKey;
    first_name: string;
    user_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  } | null;
  onConfirm: () => void;
  onBack: () => void;
}

export const TransferModalSecondStep = ({
  transferData,
  recipient,
  onConfirm,
  onBack,
}: TransferModalSecondStepProps) => {
  const t = useI18n();

  if (!recipient) {
    return <div>{t("transfer.error.recipientMissing")}</div>;
  }

  const recipientName =
    recipient.first_name ||
    recipient.user_name ||
    t("transfer.label.externalAddress");
  const recipientIdentifier = recipient.wallet_address.toBase58();

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center space-x-4 bg-zinc-800 p-4 rounded-lg border border-zinc-700">
        <Avatar className="h-12 w-12">
          <AvatarImage src={recipient.avatar_url} alt={recipientName} />
          <AvatarFallback className="bg-zinc-700">
            {recipientName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || <User size={20} />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium text-white truncate">
            {recipientName}
          </p>
          <p className="text-sm text-zinc-400 truncate">
            {recipientIdentifier}
          </p>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-zinc-400">
          {t("transfer.label.amountToSend")}
        </p>
        <p className="text-4xl font-bold text-white">
          {formatUsdcBalance(transferData.amount)}
        </p>
        <p className="text-sm text-zinc-500">
          {t("wallet.crypto") + " " + transferData.amount}
        </p>
      </div>

      <div className="flex justify-between gap-4 pt-4">
        <Button variant="outline" onClick={onBack} className="w-full">
          {t("transfer.button.back")}
        </Button>
        <Button
          onClick={onConfirm}
          className="w-full bg-violet-600 hover:bg-violet-700 text-blue-50"
        >
          {t("transfer.button.confirmTransfer")}
        </Button>
      </div>
    </div>
  );
};
