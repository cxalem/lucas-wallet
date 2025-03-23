"use client";

import { Separator } from "@radix-ui/react-separator";
import { CopyHash } from "../copy-hash";
import { UserRoundPen } from "lucide-react";
import { transferFormSchema } from "@/utils/schemas";
import { z } from "zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { useI18n } from "@/locales/client";
import { PublicKey } from "@solana/web3.js";

type TransferSuccessProps = {
  onClick: () => void;
  transferData: z.infer<typeof transferFormSchema> | null;
  recipient: {
    first_name: string;
    last_name: string;
    user_name: string;
    wallet_address: PublicKey;
  } | null;
  transactionHash: string | null;
  isContactAdded: boolean | undefined;
  handleAddContact: () => void;
};

export const TransferSuccess = ({
  onClick,
  transferData,
  recipient,
  transactionHash,
  isContactAdded,
  handleAddContact,
}: TransferSuccessProps) => {
  const t = useI18n();

  const recipientName =
    recipient?.first_name && recipient?.last_name
      ? `${recipient.first_name} ${recipient.last_name}`
      : `@${recipient?.user_name}`;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col mt-4">
        <span className="text-zinc-50 text-opacity-70">
          {t("transfer.success.sent")}
        </span>
        <span className="text-zinc-50 font-bold text-2xl">
          {transferData?.amount} {t("wallet.crypto")}
        </span>
      </div>
      <div className="flex gap-2 items-end">
        <span className="text-zinc-50 text-opacity-70">
          {t("transfer.success.to")}
        </span>
        <span className="text-zinc-50 font-bold text-xl max-w-sm truncate">
          {recipientName}
        </span>
      </div>

      <div className="flex px-1 w-full mt-2">
        <Separator className="border border-neutral-50/40 w-full" />
      </div>

      <div className="flex justify-between gap-2 px-1">
        <span className="text-zinc-50/70">{t("transfer.success.hash")}</span>
        <span title={transactionHash ?? ""} className="text-zinc-50">
          <CopyHash hash={transactionHash ?? ""} />
        </span>
      </div>

      <div className="flex w-full gap-3">
        <DialogClose asChild>
          <Button className="w-full" variant={"secondary"} onClick={onClick}>
            {t("transfer.success.close")}
          </Button>
        </DialogClose>
        {!isContactAdded && !recipient?.wallet_address && (
          <Button onClick={handleAddContact} className="flex items-center">
            <UserRoundPen className="w-4 h-4" />{" "}
            {t("transfer.success.addContact")}
          </Button>
        )}
      </div>
    </div>
  );
};
