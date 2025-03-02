"use client";

import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { DialogClose } from "@/components/ui/dialog";
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
};

export const TransferModalThirdStep = ({
  passwordForm,
  handlePasswordFormSubmit,
  setTransferState,
}: TransferModalThirdStepProps) => {
  return (
    <Form {...passwordForm}>
      <form
        onSubmit={passwordForm.handleSubmit(handlePasswordFormSubmit)}
        className="space-y-6"
      >
        <FormField
          control={passwordForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Escribe tu contraseña"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Ingresa la contraseña de tu cuenta para confirmar la
                transferencia.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit">Confirmar</Button>
          <DialogClose asChild>
            <Button
              variant="secondary"
              onClick={() => setTransferState(TransferStateEnum.Idle)}
            >
              Cancelar
            </Button>
          </DialogClose>
        </div>
      </form>
    </Form>
  );
};
