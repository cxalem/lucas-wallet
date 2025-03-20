"use client";

import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { passwordFormSchema, transferFormSchema } from "@/utils/schemas";
import { TransferStateEnum } from "@/types";
import { useI18n } from "@/locales/client";
import { SetStateAction } from "react";
import { Dispatch } from "react";
import { PublicKey } from "@solana/web3.js";

type TransferModalThirdStepProps = {
  passwordForm: UseFormReturn<z.infer<typeof passwordFormSchema>>;
  handlePasswordFormSubmit: (
    values: z.infer<typeof passwordFormSchema>
  ) => void;
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
  isSending: boolean;
};

export const TransferModalThirdStep = ({
  passwordForm,
  handlePasswordFormSubmit,
  setTransferState,
  isSending,
}: TransferModalThirdStepProps) => {
  const t = useI18n();

  return (
    <Form {...passwordForm}>
      <form
        onSubmit={passwordForm.handleSubmit(handlePasswordFormSubmit)}
        className="space-y-6 mt-4"
      >
        <FormField
          control={passwordForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("transfer.password.label")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("transfer.password.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("transfer.password.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4 w-full">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() =>
              setTransferState((prev) => ({
                ...prev,
                state: TransferStateEnum.Validating,
              }))
            }
          >
            {t("transfer.button.back")}
          </Button>

          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending
              ? t("transfer.button.confirming")
              : t("transfer.button.confirm")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
