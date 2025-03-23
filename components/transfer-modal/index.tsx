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
import { INPUT_ERROR_TYPES } from "@/utils/constants";
import { passwordFormSchema, transferFormSchema } from "@/utils/schemas";
import { Contact } from "@/types";
import { TransferModalFirstStep } from "./first-transfer-step";
import { TransferModalSecondStep } from "./second-transfer-step";
import { TransferModalThirdStep } from "./third-transfer-step";
import { TransferStateEnum } from "@/types";
import {
  addTransactionToDb,
  decryptPrivateKey,
  getUsdcBalance,
  sendSolanaTransaction,
} from "./actions";
import { ContactCard } from "../contacts/contact-card";
import { addContact, getContact } from "../contacts/actions";
import { TransferSuccess } from "./success-step";

import { Keypair, PublicKey } from "@solana/web3.js";
import { isValidSolanaAddress } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

type TransferModalProps = {
  type?: "transfer" | "contact";
  contact?: Contact;
};

export default function TransferModal({
  type = "transfer",
  contact,
}: TransferModalProps) {
  const supabase = createClient();

  const [transfer, setTransfer] = useState({
    state: TransferStateEnum.Idle,
    data: null as z.infer<typeof transferFormSchema> | null,
    recipient: null as {
      wallet_address: PublicKey;
      first_name: string;
      user_name: string;
      last_name: string;
      email: string;
    } | null,
    transactionHash: null as string | null,
  });

  const [userBalance, setUserBalance] = useState<string | null>(null);

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

  const queryClient = useQueryClient();

  async function handleTransferFormSubmit(
    values: z.infer<typeof transferFormSchema>
  ) {
    try {
      if (isValidSolanaAddress(values.email)) {
        setTransfer((prev) => ({
          ...prev,
          state: TransferStateEnum.Validating,
          data: values,
          recipient: {
            wallet_address: values.email as unknown as PublicKey,
            email: values.email,
            first_name: "",
            last_name: "",
            user_name: values.email,
          },
          transactionHash: null,
        }));
        return;
      }
      const loggedUser = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", values.email);

      if (error) {
        console.error("Error getting user", error);
        setInputError(INPUT_ERROR_TYPES.user_not_found);
        return;
      }

      if (!data || data.length === 0) {
        console.error("No users found with that email.");
        setInputError(INPUT_ERROR_TYPES.user_not_found);
        return;
      }

      if (loggedUser?.data.user?.email === values.email) {
        console.error("You can't transfer funds to your own account.");
        setInputError(INPUT_ERROR_TYPES.same_account);
        return;
      }

      setTransfer((prev) => ({
        ...prev,
        state: TransferStateEnum.Validating,
        data: values,
        recipient: data[0],
        transactionHash: null,
      }));
    } catch (err) {
      console.error("Unexpected error searching user:", err);
      setTransfer((prev) => ({
        ...prev,
        state: TransferStateEnum.Error,
        data: null,
        recipient: null,
        transactionHash: null,
      }));
    }
  }

  async function handlePasswordFormSubmit(
    values: z.infer<typeof passwordFormSchema>
  ) {
    if (!transfer.data || !transfer.recipient) {
      console.error("Incomplete data for transfer");
      return;
    }
    try {
      setTransfer((prev) => ({
        ...prev,
        state: TransferStateEnum.Pending,
      }));
      setIsSending(true);

      const loggedUser = await supabase.auth.getUser();
      if (!loggedUser?.data.user) {
        console.error("No authenticated user");
        return;
      }

      const userMetadata = loggedUser.data.user.user_metadata as {
        salt: string;
        iv: string;
        ciphertext: string;
      };

      const privateKey = await decryptPrivateKey(values.password, userMetadata);

      const privateKeyUint8Array = Uint8Array.from(
        Buffer.from(privateKey, "hex")
      );

      const senderKeypair = Keypair.fromSecretKey(privateKeyUint8Array);

      const recipientPublicKey = new PublicKey(
        transfer.recipient.wallet_address
      );

      const signature = await sendSolanaTransaction(
        privateKeyUint8Array,
        transfer.recipient.wallet_address,
        transfer.data.amount
      );

      const txDetails = {
        from: senderKeypair.publicKey.toBase58(),
        to: recipientPublicKey.toBase58(),
        amount: transfer.data.amount,
        signature: signature,
      };

      if (!signature) {
        console.error("❌ Transaction failed");
        setTransfer((prev) => ({
          ...prev,
          state: TransferStateEnum.Error,
        }));
        return;
      }

      setTransfer((prev) => ({
        ...prev,
        transactionHash: signature,
      }));

      const createdAt = new Date().toISOString();

      console.log("txDetails", txDetails);

      await addTransactionToDb(
        txDetails,
        {
          wallet_address: txDetails.from,
          email: loggedUser.data.user.email!,
        },
        {
          wallet_address: txDetails.to,
          email: transfer.recipient.email,
        },
        createdAt
      );

      await isContact();

      setIsSending(false);
      setTransfer((prev) => ({
        ...prev,
        state: TransferStateEnum.Success,
      }));
    } catch (err) {
      console.error("Error in transfer:", err);
      setTransfer((prev) => ({
        ...prev,
        state: TransferStateEnum.Error,
      }));
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
      console.error("Error adding contact:", res.error);
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

  const handleClose = async () => {
    const loggedUser = await supabase.auth.getUser();

    if (!loggedUser?.data.user) {
      console.error("There is no logged user");
      return;
    }

    queryClient.invalidateQueries({
      queryKey: [
        "usdcBalance",
        {
          walletAddress: loggedUser.data.user.user_metadata.wallet_address,
        },
      ],
    });

    queryClient.invalidateQueries({
      queryKey: [
        "contacts",
        {
          userId: loggedUser.data.user.id,
        },
      ],
    });

    setTransfer((prev) => ({
      ...prev,
      state: TransferStateEnum.Idle,
      transactionHash: null,
      recipient: null,
      data: null,
    }));
    setUserBalance(null);
    setUserContact(null);
    setInputError(null);
    transferForm.reset();
    passwordForm.reset();
  };

  return (
    <Dialog>
      {type === "transfer" ? (
        <DialogTrigger
          onClick={async () => {
            const balance = await getUsdcBalance();
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
            <DialogTitle>{getDialogTitle(transfer.state)}</DialogTitle>
            <DialogDescription>
              {getDialogDescription(transfer.state)}
            </DialogDescription>
          </DialogHeader>

          {transfer.state === TransferStateEnum.Validating && transfer.data ? (
            /* ---------------------- Step 2: Validation ---------------------- */
            <TransferModalSecondStep
              transferData={transfer.data}
              recipient={transfer.recipient}
              setTransferState={setTransfer}
            />
          ) : transfer.state === "pending" ? (
            /* ----------------------- Step 3: Confirm password ---------------------- */
            <TransferModalThirdStep
              passwordForm={passwordForm}
              handlePasswordFormSubmit={handlePasswordFormSubmit}
              setTransferState={setTransfer}
              isSending={isSending}
            />
          ) : transfer.state === "success" ? (
            /* ----------------------- Success ----------------------- */
            <TransferSuccess
              onClick={handleClose}
              transferData={transfer.data}
              recipient={transfer.recipient}
              transactionHash={transfer.transactionHash}
              isContactAdded={isContactAdded}
              handleAddContact={handleAddContact}
            />
          ) : transfer.state === "error" ? (
            /* ----------------------- Error ----------------------- */
            <div className="flex flex-col items-center gap-4">
              <p className="text-red-600">An error occurred in the transfer.</p>
              <Button
                onClick={() =>
                  setTransfer((prev) => ({
                    ...prev,
                    state: TransferStateEnum.Idle,
                    data: null,
                    recipient: null,
                    transactionHash: null,
                  }))
                }
              >
                Retry
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
