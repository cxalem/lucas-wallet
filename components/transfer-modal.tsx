"use client";

import { useEffect, useState } from "react";
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
import { walletClient, client } from "@/wallet.config";
import { INPUT_ERROR_TYPES } from "@/utils/constants";
import { passwordFormSchema, transferFormSchema } from "@/utils/schemas";
import { Contact } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { XIcon } from "lucide-react";
import { formatEther } from "viem";

type TransferModalProps = {
  type?: "transfer" | "contact";
  contact?: Contact;
};

export default function TransferModal({
  type = "transfer",
  contact,
}: TransferModalProps) {
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

  const [userContact, setUserContact] = useState<Contact | null>(null);

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

  const getUserBalance = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error al obtener el usuario", error);
      return;
    }

    const { user_metadata } = data.user;

    const balance = await client.getBalance({
      address: user_metadata.wallet_address,
    });
    const formattedBalance = formatEther(balance);
    return formattedBalance.slice(0, 5);
  };

  const [userBalance, setUserBalance] = useState<string | null>(null);

  useEffect(() => {
    if (userContact) {
      getUserBalance().then((balance) => {
        if (balance) {
          setUserBalance(balance);
        }
      });
    }
  }, [userContact]);

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog>
      {type === "transfer" ? (
        <DialogTrigger className="bg-gradient-to-r from-violet-800 via-violet-600 to-violet-800  px-10 py-2 rounded-full text-zinc-50 font-medium hover:shadow-xl w-full duration-150 shadow-md">
          Transferir
        </DialogTrigger>
      ) : (
        type === "contact" &&
        contact && (
          <DialogTrigger
            onClick={() => {
              transferForm.setValue("email", contact.email);
              setUserContact(contact);
            }}
            className="flex cursor-pointer items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors w-full"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {contact.avatarUrl ? (
                  <Image
                    src={contact.avatarUrl || "/placeholder.svg"}
                    alt={contact.name}
                    width={40}
                    height={40}
                  />
                ) : (
                  <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col text-start">
                <span className="text-sm text-muted-foreground">
                  {contact.email}
                </span>
                <span className="font-medium">{contact.name}</span>
              </div>
            </div>
            {contact?.phone && (
              <span className="text-muted-foreground">{contact.phone}</span>
            )}
          </DialogTrigger>
        )
      )}

      <DialogContent className="bg-neutral-900">
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
              <Button
                variant="secondary"
                onClick={() => setTransferState("idle")}
              >
                No
              </Button>
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
              className="space-y-4"
              onSubmit={transferForm.handleSubmit(handleTransferFormSubmit)}
            >
              <FormField
                control={transferForm.control}
                name="email"
                render={({ field }) => (
                  <div>
                    <FormItem className={`${userContact && "hidden"}`}>
                      <FormLabel>Email</FormLabel>
                      <FormControl
                        onChange={(e) => {
                          setInputError(null);
                          field.onChange(e);
                        }}
                      >
                        <Input
                          placeholder="Correo del destinatario"
                          value={userContact?.email || field.value}
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

                    {userContact && (
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => {
                            transferForm.setValue("email", "");
                            setUserContact(null);
                          }}
                          className="flex justify-between bg-neutral-800 w-full h-fit px-3 py-1 hover:bg-neutral-700"
                        >
                          <div className="flex flex-col text-start items-start">
                            <span className="text-lg text-blue-50 font-bold">
                              {userContact.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {userContact.email}
                            </span>
                          </div>
                          <XIcon className="w-4 h-4 text-muted-foreground" />
                        </Button>

                        {inputError ? (
                          <span className="text-red-400 px-2">
                            {inputError?.message}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm px-3">
                            (*) Asegúrate de que sea el destinatario correcto
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              />
              <FormField
                control={transferForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad que deseas transferir</FormLabel>
                    <div className="m-0 h-24 bg-neutral-700 rounded-lg flex flex-col justify-between py-2 px-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">
                          Saldo disponible:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            ${userBalance}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            ETH
                          </span>
                        </div>
                      </div>
                      <FormControl>
                        <div className="flex text-3xl gap-1">
                          $
                          <Input
                            placeholder="Cantidad de ETH"
                            className="border-none h-fit p-0 !text-3xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            type="number"
                            step="any"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </div>
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
