"use client";

import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { passwordFormSchema } from "@/utils/schemas";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/locales/client";

interface TransferModalThirdStepProps {
  passwordForm: UseFormReturn<z.infer<typeof passwordFormSchema>>;
  handlePasswordFormSubmit: (
    values: z.infer<typeof passwordFormSchema>
  ) => Promise<void>;
  onBack: () => void;
  isSending: boolean;
  errorMessage?: string;
}

export const TransferModalThirdStep = ({
  passwordForm,
  handlePasswordFormSubmit,
  onBack,
  isSending,
  errorMessage,
}: TransferModalThirdStepProps) => {
  const t = useI18n();

  return (
    <Form {...passwordForm}>
      <form
        onSubmit={passwordForm.handleSubmit(handlePasswordFormSubmit)}
        className="space-y-6 pt-4"
      >
        <FormField
          control={passwordForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">
                {t("transfer.password.label")}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("transfer.password.placeholder")}
                  {...field}
                  className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-violet-500"
                />
              </FormControl>
              <FormMessage className="text-red-500" />
              {errorMessage && (
                <p className="text-sm font-medium text-red-500">
                  {errorMessage}
                </p>
              )}
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSending}
            className="w-full"
          >
            {t("transfer.button.back")}
          </Button>
          <Button
            type="submit"
            disabled={isSending}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-blue-50"
          >
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSending
              ? t("transfer.button.confirming")
              : t("transfer.button.confirm")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
