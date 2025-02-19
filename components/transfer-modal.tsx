"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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

import { createClient } from "@/utils/supabase/client";
import { decryptData } from "@/app/security/encrypt";
import { walletClient } from "@/wallet.config";
import { INPUT_ERROR_TYPES } from "@/utils/constants";
import { passwordFormSchema, transferFormSchema } from "@/utils/schemas";

export default function TransferModal() {
  const supabase = createClient();

  // Transfer states for controlling flow of the process
  const [transferState, setTransferState] = useState<
    "idle" | "validating" | "pending" | "success" | "error"
  >("idle");

  // Store the form data from the first step
  const [transferData, setTransferData] = useState<z.infer<
    typeof transferFormSchema
  > | null>(null);

  // Store the user object from the database
  const [recipient, setRecipient] = useState<{
    wallet_address: `0x${string}`;
    first_name: string;
    last_name: string;
    email: string;
  } | null>(null);

  const [inputError, setInputError] = useState<
    (typeof INPUT_ERROR_TYPES)[keyof typeof INPUT_ERROR_TYPES] | null
  >(null);

  const transferForm = useForm<z.infer<typeof transferFormSchema>>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      email: "",
      amount: 0,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  /**
   * First form submit handler - fetch recipient data by email.
   */
  async function handleTransferFormSubmit(
    values: z.infer<typeof transferFormSchema>
  ) {
    try {
      // 1. Retrieve user data from Supabase to get the private key
      const loggedUser = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", values.email);

      if (error) {
        console.error("Error al obtener el usuario", error);
        setInputError(INPUT_ERROR_TYPES.user_not_found);
        return;
      }

      if (!data || data.length === 0) {
        console.error("No se encontraron usuarios con ese email.");
        setInputError(INPUT_ERROR_TYPES.user_not_found);
        return;
      }

      if (loggedUser?.data.user?.email === values.email) {
        console.error("No puedes transferir fondos a tu propia cuenta.");
        setInputError(INPUT_ERROR_TYPES.same_account);
        return;
      }

      // Save the transfer data and user info for the next step
      setTransferData(values);
      setRecipient(data[0]);
      setTransferState("validating");
    } catch (err) {
      console.error("Error inesperado al buscar usuario:", err);
      setTransferState("error");
    }
  }

  /**
   * Confirm transfer with the user's password.
   */
  async function handlePasswordFormSubmit(
    values: z.infer<typeof passwordFormSchema>
  ) {
    if (!transferData || !recipient) {
      // Basic safeguard
      console.error("Datos incompletos para la transferencia.");
      return;
    }

    try {
      setTransferState("pending");

      // 1. Retrieve user data from Supabase to get the private key
      const loggedUser = await supabase.auth.getUser();

      if (!loggedUser?.data.user) {
        console.error("No hay usuario autenticado.");
        return;
      }

      const { salt, iv, ciphertext } = loggedUser.data.user?.user_metadata as {
        salt: string;
        iv: string;
        ciphertext: string;
      };

      // 2. Decrypt private key with user password
      const decrypted = await decryptData(values.password, {
        salt,
        iv,
        ciphertext,
      });
      const { privateKey } = JSON.parse(decrypted);

      // 3. Instantiate a wallet client using the private key
      const client = walletClient(privateKey);

      // 4. Format the amount (in wei, if using 18 decimals)
      const weiAmount = BigInt(Math.floor(transferData.amount * 1e18));

      // 5. Send transaction
      const tx = await client.sendTransaction({
        to: recipient.wallet_address,
        value: weiAmount,
      });

      console.log("Transferencia exitosa, hash:", tx);

      // 6. Mark the state as success
      setTransferState("success");
    } catch (err) {
      console.error("Error en la transferencia:", err);
      setTransferState("error");
    }
  }

  return (
    <Dialog>
      <DialogTrigger className="w-full h-full max-h-10 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-50 duration-150 font-semibold shadow-md">
        Transferir
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir</DialogTitle>
          <DialogDescription>
            Ingresa la información para transferir fondos.
          </DialogDescription>
        </DialogHeader>

        {transferState === "validating" && transferData ? (
          /* ---------------------- Step 2: Validate transfer ---------------------- */
          <div className="flex flex-col gap-4">
            <p>
              ¿Estás seguro de que deseas transferir{" "}
              <span className="text-red-400">{transferData.amount} ETH</span> a{" "}
              <span className="text-red-400 font-bold">
                {recipient?.first_name} {recipient?.last_name} (
                {recipient?.email})
              </span>
              ?
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setTransferState("pending")}>Sí</Button>
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  onClick={() => setTransferState("idle")}
                >
                  No
                </Button>
              </DialogClose>
            </div>
          </div>
        ) : transferState === "pending" ? (
          /* ----------------------- Step 3: Confirm password ---------------------- */
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
                    onClick={() => setTransferState("idle")}
                  >
                    Cancelar
                  </Button>
                </DialogClose>
              </div>
            </form>
          </Form>
        ) : transferState === "success" ? (
          /* ----------------------- Success Message ----------------------- */
          <div className="flex flex-col items-center gap-4">
            <p className="text-green-600">Transferencia exitosa</p>
            <DialogClose asChild>
              <Button onClick={() => setTransferState("idle")}>Cerrar</Button>
            </DialogClose>
          </div>
        ) : transferState === "error" ? (
          /* ----------------------- Error Message ----------------------- */
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-600">
              Ocurrió un error en la transferencia.
            </p>
            <Button onClick={() => setTransferState("idle")}>Reintentar</Button>
          </div>
        ) : (
          /* ---------------------- Step 1: Transfer form ---------------------- */
          <Form {...transferForm}>
            <form
              onSubmit={transferForm.handleSubmit(handleTransferFormSubmit)}
              className="space-y-6"
            >
              <FormField
                control={transferForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl
                      onChange={(e) => {
                        setInputError(null);
                        field.onChange(e);
                      }}
                    >
                      <Input
                        placeholder="Correo del destinatario"
                        {...field}
                        className={inputError ? "border-red-600" : ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {!inputError ? (
                        "Ingresa el email de la cuenta a la que quieres transferir."
                      ) : (
                        <span className="text-red-600">
                          {inputError?.message}
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={transferForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cantidad de ETH"
                        type="number"
                        step="any"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Siguiente</Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
