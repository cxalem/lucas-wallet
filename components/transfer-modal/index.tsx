"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { createClient } from "@/utils/supabase/client";
import { walletClient } from "@/wallet.config";
import { INPUT_ERROR_TYPES } from "@/utils/constants";
import {
  passwordFormSchema,
  transferFormSchema,
  transactionReceiptSchema,
} from "@/utils/schemas";
import { Contact } from "@/types";
import { TransferModalFirstStep } from "./first-transfer-step";
import { TransferModalSecondStep } from "./second-transfer-step";
import { TransferModalThirdStep } from "./third-transfer-step";
import { TransferStateEnum } from "@/types";
import {
  addTransactionToDb,
  decryptPrivateKey,
  getTransactionDetails,
  getUserBalance,
} from "./actions";
import { ContactCard } from "../contacts/contact-card";
import { addContact, getContact } from "../contacts/actions";
import { TransferSuccess } from "./success-step";

type TransferModalProps = {
  type?: "transfer" | "contact";
  contact?: Contact;
};

export default function TransferModal({
  type = "transfer",
  contact,
}: TransferModalProps) {
  const supabase = createClient();

  // Transfer states
  const [transferState, setTransferState] = useState<TransferStateEnum>(
    TransferStateEnum.Idle
  );

  // Store form data from the first step
  const [transferData, setTransferData] = useState<z.infer<
    typeof transferFormSchema
  > | null>(null);

  // Store the user (recipient) from DB
  const [recipient, setRecipient] = useState<{
    wallet_address: `0x${string}`;
    first_name: string;
    last_name: string;
    email: string;
  } | null>(null);

  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(
    null
  );

  /* ********** I'll need this later, that's why I'm keeping it here ********** */
  // const [transactionDetails, setTransactionDetails] = useState<z.infer<
  //   typeof transactionReceiptSchema
  // > | null>(null);

  const [isSending, setIsSending] = useState(false);

  // Error states
  const [inputError, setInputError] = useState<
    (typeof INPUT_ERROR_TYPES)[keyof typeof INPUT_ERROR_TYPES] | null
  >(null);

  // If user clicked on a known contact
  const [userContact, setUserContact] = useState<Contact | null>(null);

  const [isContactAdded, setIsContactAdded] = useState<boolean | undefined>(
    undefined
  );

  // React Hook Form
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

  const [userBalance, setUserBalance] = useState<string | null>(null);

  async function handleTransferFormSubmit(
    values: z.infer<typeof transferFormSchema>
  ) {
    try {
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

      setTransferData(values);
      setRecipient(data[0]);
      setTransferState(TransferStateEnum.Validating);
    } catch (err) {
      console.error("Error inesperado al buscar usuario:", err);
      setTransferState(TransferStateEnum.Error);
    }
  }

  async function handlePasswordFormSubmit(
    values: z.infer<typeof passwordFormSchema>
  ) {
    if (!transferData || !recipient) {
      console.error("Datos incompletos para la transferencia.");
      return;
    }
    try {
      setTransferState(TransferStateEnum.Pending);
      setIsSending(true);

      const loggedUser = await supabase.auth.getUser();
      if (!loggedUser?.data.user) {
        console.error("No hay usuario autenticado.");
        return;
      }

      const userMetadata = loggedUser.data.user.user_metadata as {
        salt: string;
        iv: string;
        ciphertext: string;
      };

      const privateKey = await decryptPrivateKey(values.password, userMetadata);

      const signerClient = walletClient(privateKey as `0x${string}`);

      const weiAmount = BigInt(Math.floor(transferData.amount * 1e18));

      const tx = await signerClient.sendTransaction({
        to: recipient.wallet_address,
        value: weiAmount,
        timeStamp: Math.floor(Date.now() / 1000),
      });

      const txDetails = (await getTransactionDetails(tx)) as z.infer<
        typeof transactionReceiptSchema
      >;

      console.log("Transferencia exitosa, hash:", txDetails);
      setTransactionHash(tx);

      const createdAt = new Date().toISOString();

      await addTransactionToDb(
        txDetails,
        {
          wallet_address: txDetails.from as `0x${string}`,
          email: loggedUser.data.user.email!,
        },
        {
          wallet_address: txDetails.to as `0x${string}`,
          email: recipient.email,
        },
        createdAt
      );

      await isContact();

      setIsSending(false);
      setTransferState(TransferStateEnum.Success);
    } catch (err) {
      console.error("Error en la transferencia:", err);
      setTransferState(TransferStateEnum.Error);
    }
  }

  function getDialogTitle(state: TransferStateEnum) {
    switch (state) {
      case TransferStateEnum.Validating:
        return "Transferring";
      case TransferStateEnum.Pending:
        return "Confirm password";
      case TransferStateEnum.Success:
        return "Transfer successful!";
      case TransferStateEnum.Error:
        return "Error";
      default:
        return "Transfer";
    }
  }

  function getDialogDescription(state: TransferStateEnum) {
    switch (state) {
      case TransferStateEnum.Validating:
        return "Please check the information and confirm the transfer";
      case TransferStateEnum.Pending:
        return "To transfer funds, please confirm your password";
      case TransferStateEnum.Success:
        return "Your transaction has been sent successfully";
      case TransferStateEnum.Error:
        return "An error occurred";
      default:
        return "Enter the information to transfer funds";
    }
  }

  const handleAddContact = async () => {
    const loggedUser = await supabase.auth.getUser();

    if (!loggedUser?.data.user) {
      console.error("There is no logged user");
      return;
    }

    if (!userContact) {
      console.error("There is no selected contact");
      return;
    }

    const res = await addContact(userContact, loggedUser.data.user);
    setIsContactAdded(true);

    if (res && res.error) {
      console.error("Error al agregar el contacto:", res.error);
    }
  };

  const isContact = async () => {
    const loggedUser = await supabase.auth.getUser();

    if (!loggedUser?.data.user) {
      console.error("There is no logged user");
      return;
    }

    if (!userContact) {
      console.error("There is no selected contact");
      return;
    }

    const contacts = await getContact(loggedUser.data.user.id);

    if (!contacts) {
      console.error("There is no contact");
      setIsContactAdded(false);
      return;
    }

    const isContact = contacts?.some(
      (c) => c.wallet_address === userContact.wallet_address
    );
    setIsContactAdded(isContact);
    return isContact;
  };

  return (
    <Dialog>
      {type === "transfer" ? (
        <DialogTrigger
          onClick={async () => {
            const balance = await getUserBalance();
            if (balance) {
              setUserBalance(balance);
            }
          }}
          className="bg-gradient-to-r from-violet-800 via-violet-600 to-violet-800 px-10 py-2 rounded-full text-zinc-50 font-medium hover:shadow-xl w-full duration-150 shadow-md"
        >
          Transfer
        </DialogTrigger>
      ) : (
        type === "contact" &&
        contact && (
          <ContactCard
            transferForm={transferForm}
            setUserBalance={setUserBalance}
            setUserContact={
              setUserContact as unknown as (contact: Contact) => void
            }
            contact={contact as unknown as Contact}
          />
        )
      )}

      <DialogContent className="bg-neutral-900">
        <div className="relative">
          <DialogHeader>
            <DialogTitle>{getDialogTitle(transferState)}</DialogTitle>
            <DialogDescription>
              {getDialogDescription(transferState)}
            </DialogDescription>
          </DialogHeader>

          {transferState === "validating" && transferData ? (
            /* ---------------------- Step 2: Validation ---------------------- */
            <TransferModalSecondStep
              transferData={transferData}
              recipient={recipient}
              setTransferState={setTransferState}
            />
          ) : transferState === "pending" ? (
            /* ----------------------- Step 3: Confirm password ---------------------- */
            <TransferModalThirdStep
              passwordForm={passwordForm}
              handlePasswordFormSubmit={handlePasswordFormSubmit}
              setTransferState={setTransferState}
              isSending={isSending}
            />
          ) : transferState === "success" ? (
            /* ----------------------- Success ----------------------- */
            <TransferSuccess
              onClick={() => {
                setTransferState(TransferStateEnum.Idle);
                setTransactionHash(null);
                setRecipient(null);
                setUserBalance(null);
                setUserContact(null);
                setTransferData(null);
                setInputError(null);
                transferForm.reset();
                passwordForm.reset();
              }}
              transferData={transferData}
              recipient={recipient}
              transactionHash={transactionHash}
              isContactAdded={isContactAdded}
              handleAddContact={handleAddContact}
            />
          ) : transferState === "error" ? (
            /* ----------------------- Error ----------------------- */
            <div className="flex flex-col items-center gap-4">
              <p className="text-red-600">
                Ocurrió un error en la transferencia.
              </p>
              <Button onClick={() => setTransferState(TransferStateEnum.Idle)}>
                Reintentar
              </Button>
            </div>
          ) : (
            /* ---------------------- Step 1: Transfer form ---------------------- */
            <TransferModalFirstStep
              transferForm={transferForm}
              setInputError={setInputError}
              userContact={userContact}
              setUserContact={setUserContact}
              handleTransferFormSubmit={handleTransferFormSubmit}
              inputError={inputError}
              userBalance={userBalance}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
