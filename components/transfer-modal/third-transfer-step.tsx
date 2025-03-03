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
import { passwordFormSchema } from "@/utils/schemas";
import { TransferStateEnum } from "@/types";

type TransferModalThirdStepProps = {
  passwordForm: UseFormReturn<z.infer<typeof passwordFormSchema>>;
  handlePasswordFormSubmit: (
    values: z.infer<typeof passwordFormSchema>
  ) => void;
  setTransferState: (state: TransferStateEnum) => void;
  isSending: boolean;
};

export const TransferModalThirdStep = ({
  passwordForm,
  handlePasswordFormSubmit,
  setTransferState,
  isSending,
}: TransferModalThirdStepProps) => {
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Escribe tu contraseña"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your password to confirm the transfer.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4 w-full">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setTransferState(TransferStateEnum.Validating)}
          >
            Back
          </Button>

          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending ? "Confirming..." : "Confirm"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
