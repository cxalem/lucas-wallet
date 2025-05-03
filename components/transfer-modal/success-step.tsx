"use client";

import { transferFormSchema } from "@/utils/schemas";
import { z } from "zod";
import { Button } from "../ui/button";
import { useI18n } from "@/locales/client";
import { PublicKey } from "@solana/web3.js";
import { formatUsdcBalance } from "@/lib/utils";
import { CheckCircle, Copy, ExternalLink, UserPlus, Check } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

type TransferSuccessProps = {
  onClick: () => void;
  transferData: z.infer<typeof transferFormSchema> | null;
  recipient: {
    first_name: string;
    last_name: string;
    user_name: string;
    wallet_address: PublicKey;
    email: string;
  } | null;
  transactionHash: string | null;
  isContactAdded: boolean | undefined;
  handleAddContact: () => Promise<void>;
  onAddContactSuccess: () => void;
};

export const TransferSuccess = ({
  onClick,
  transferData,
  recipient,
  transactionHash,
  isContactAdded,
  handleAddContact,
  onAddContactSuccess,
}: TransferSuccessProps) => {
  const t = useI18n();
  const [copied, setCopied] = useState(false);

  const recipientName =
    recipient?.first_name && recipient?.last_name
      ? `${recipient.first_name} ${recipient.last_name}`
      : recipient?.user_name
      ? `@${recipient.user_name}`
      : t("transfer.label.externalAddress");

  const copyTxHash = () => {
    if (transactionHash) {
      navigator.clipboard.writeText(transactionHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddContactClick = async () => {
    await handleAddContact();
    onAddContactSuccess();
  };

  return (
    <div className="flex flex-col items-center space-y-6 pt-6 pb-2">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <div className="text-center">
        <p className="text-2xl font-semibold text-white">
          {t("transfer.success.title")}
        </p>
        <p className="text-lg text-zinc-400">
          {t("transfer.success.description", {
            amount: formatUsdcBalance(transferData?.amount || 0),
            name: recipientName,
          })}
        </p>
      </div>

      {transactionHash && (
        <div className="w-full p-3 bg-zinc-800 max-w-sm rounded-lg border border-zinc-700 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-sm text-zinc-400">
              {t("transfer.success.txLabel")}
            </span>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <span className="text-sm text-zinc-300 font-mono truncate cursor-default">
                    {transactionHash}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{transactionHash}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <button
                    onClick={copyTxHash}
                    className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-700 ease-in-out duration-150"
                    aria-label={
                      copied
                        ? t("transfer.success.aria.copied")
                        : t("transfer.success.aria.copyHash")
                    }
                  >
                    {copied ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {copied
                      ? t("transfer.success.copied")
                      : t("transfer.success.copyHash")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Link
                    href={`https://solscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white"
                    aria-label={t("transfer.success.aria.viewOnSolscan")}
                  >
                    <ExternalLink size={16} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("transfer.success.viewOnSolscan")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {isContactAdded === false && recipient?.email && (
        <Button
          variant="outline"
          onClick={handleAddContactClick}
          className="w-full flex items-center gap-2"
        >
          <UserPlus size={16} />
          {t("transfer.success.addContactButton", { name: recipientName })}
        </Button>
      )}
      {isContactAdded === true && (
        <p className="text-sm text-green-500">
          {t("transfer.success.addedToContacts")}
        </p>
      )}

      <Button
        onClick={onClick}
        className="w-full bg-violet-600 hover:bg-violet-700 text-blue-50 cursor-pointer"
      >
        {t("transfer.button.done")}
      </Button>
    </div>
  );
};
