"use client";

import { transferFormSchema } from "@/utils/schemas";
import { Button } from "../ui/button";
import { z } from "zod";
import { TransferStateEnum } from "@/types";
import { Separator } from "@radix-ui/react-separator";
import { useI18n } from "@/locales/client";
import { Dispatch, SetStateAction } from "react";
import { PublicKey } from "@solana/web3.js";
type TransferModalSecondStepProps = {
  transferData: z.infer<typeof transferFormSchema>;
  recipient: {
    wallet_address: PublicKey;
    user_name: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  setTransferState: Dispatch<
    SetStateAction<{
      state: TransferStateEnum;
      data: z.infer<typeof transferFormSchema> | null;
      recipient: {
        wallet_address: PublicKey;
        first_name: string;
        user_name: string;
        last_name: string;
        email: string;
      } | null;
      transactionHash: string | null;
    }>
  >;
};

export const TransferModalSecondStep = ({
  transferData,
  recipient,
  setTransferState,
}: TransferModalSecondStepProps) => {
  const t = useI18n();

  const nameAndLastName =
    recipient?.first_name && recipient?.last_name
      ? `${recipient.first_name} ${recipient.last_name}`
      : null;

  const nameOrUsername = nameAndLastName || `@${recipient?.user_name}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-zinc-50 gap-1 flex flex-col mt-4">
        <span className="text-zinc-400">{t("transfer.to.label")}</span>
        <div className="flex flex-col gap-1 bg-neutral-800 px-4 py-2 rounded-lg">
          <span className="font-semibold text-2xl max-w-sm truncate">
            {nameOrUsername}
          </span>{" "}
          <span className="text-zinc-400">{recipient?.email}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-zinc-400">{t("transfer.amount.label2")}</span>
        <div className="flex gap-2 items-end justify-between bg-neutral-800 px-4 py-2 rounded-lg w-full">
          <span className="font-bold text-3xl">${transferData.amount}</span>
          <span className="text-zinc-400">
            {transferData.amount} {t("wallet.crypto")}
          </span>
        </div>
      </div>

      <div className="px-2 opacity-40">
        <Separator className="my-4 border border-neutral-100" />
      </div>

      <div className="flex gap-4 w-full">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() =>
            setTransferState((prev) => ({
              ...prev,
              state: TransferStateEnum.Idle,
            }))
          }
        >
          {t("transfer.button.back")}
        </Button>
        <Button
          className="w-full"
          onClick={() =>
            setTransferState((prev) => ({
              ...prev,
              state: TransferStateEnum.Pending,
            }))
          }
        >
          {t("transfer.button.transfer")}
        </Button>
      </div>
    </div>
  );
};
