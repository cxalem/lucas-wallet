"use client";

import { useCallback, useState } from 'react';
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { useQueryClient } from "@tanstack/react-query";

import { passwordFormSchema, transferFormSchema } from "@/utils/schemas";
import { isValidSolanaAddress } from "@/lib/utils";
import { Contact } from "@/types";
import { useI18n } from "@/locales/client";
import { createClient } from "@/utils/supabase/client"; // Use client-side Supabase

import {
  addTransactionToDb,
  decryptPrivateKey,
  sendSolanaTransaction,
  getUsdcBalance,
} from "./actions";
import { addContact, getContact } from "../contacts/actions";
import { TransferStateData, RecipientInfo, Action } from './useTransferState';

type TransferFormValues = z.infer<typeof transferFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

type UseTransferHandlersProps = {
  state: TransferStateData;
  dispatch: React.Dispatch<Action>;
  transferForm: UseFormReturn<TransferFormValues>;
  passwordForm: UseFormReturn<PasswordFormValues>;
  setInputError: React.Dispatch<React.SetStateAction<string | null>>;
  setUserBalance: React.Dispatch<React.SetStateAction<string | null>>;
  setUserContact: React.Dispatch<React.SetStateAction<Contact | null>>;
};

export function useTransferHandlers({
  state,
  dispatch,
  transferForm,
  passwordForm,
  setInputError,
  setUserBalance,
  setUserContact,
}: UseTransferHandlersProps) {
  const t = useI18n();
  const supabase = createClient(); // Initialize client-side Supabase
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [isContactAdded, setIsContactAdded] = useState<boolean | undefined>(undefined);


  const handleTransferFormSubmit = useCallback(async (values: TransferFormValues) => {
    setInputError(null);
    try {
      let recipientInfo: RecipientInfo | null = null;

      if (isValidSolanaAddress(values.email)) {
        let recipientPublicKey: PublicKey;
        try {
          recipientPublicKey = new PublicKey(values.email);
          recipientInfo = {
            wallet_address: recipientPublicKey,
            email: values.email, // Use the address as email placeholder? Or fetch ENS/SNS?
            first_name: "",
            last_name: "",
            user_name: "External Address",
            avatar_url: undefined,
          };
        } catch (e) {
          console.error("Invalid external Solana address format", e);
          setInputError(t("transfer.error.invalidRecipientAddress"));
          return;
        }
      } else {
        // Check internal user
        const loggedUser = await supabase.auth.getUser();
        if (loggedUser?.data.user?.email === values.email) {
          console.error("You can\'t transfer funds to your own account.");
          setInputError(t("transfer.error.authRequired"));
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*, email") // Ensure email is selected if not default
          .eq("email", values.email)
          .single(); // Use single() for expecting one or zero results

        if (error || !data) {
          console.error("Error getting user or user not found", error);
          setInputError(t("transfer.error.findUser"));
          return;
        }

        if (!data.wallet_address) {
           console.error("Recipient user has no wallet address.");
           setInputError(t("transfer.error.findUser"));
           return;
        }

        let recipientPublicKey: PublicKey;
        try {
          recipientPublicKey = new PublicKey(data.wallet_address);
          recipientInfo = {
            ...data,
            wallet_address: recipientPublicKey,
            avatar_url: data.avatar_url || undefined, // Handle potential null
          };
        } catch (e) {
          console.error("Invalid stored Solana address format for recipient", e);
          setInputError(t("transfer.error.internal"));
          return;
        }
      }

      if (recipientInfo) {
         dispatch({ type: 'START_VALIDATION', payload: { formData: values, recipient: recipientInfo } });
      }

    } catch (err) {
      console.error("Unexpected error searching user:", err);
      setInputError(t("transfer.error.findUser"));
      dispatch({ type: 'RESET' }); // Reset state on unexpected error during search
    }
  }, [supabase, setInputError, dispatch, t]);


  const checkAndSetContactStatus = useCallback(async (recipientAddress: PublicKey | null) => {
      if (!recipientAddress) {
          setIsContactAdded(false);
          return false;
      }
      const loggedUser = await supabase.auth.getUser();
      if (!loggedUser?.data.user) return false;

      try {
          const contacts = await getContact(loggedUser.data.user.id);
          if (!contacts) {
              setIsContactAdded(false);
              return false;
          }
          const recipientAddressString = recipientAddress.toBase58();
          const isAlreadyContact = contacts.some(
              (c) => c.wallet_address === recipientAddressString
          );
          setIsContactAdded(isAlreadyContact);
          return isAlreadyContact;
      } catch (error) {
          console.error("Failed to check contacts:", error);
          setIsContactAdded(false); // Assume not contact on error
          return false;
      }
  }, [supabase]);


  const handlePasswordFormSubmit = useCallback(async (values: PasswordFormValues) => {
    if (!state.formData || !state.recipient) {
      console.error("Incomplete data for transfer");
      dispatch({ type: 'SET_ERROR', payload: { message: t("transfer.error.internal") } });
      return;
    }

    dispatch({ type: 'START_SENDING' });
    setIsSending(true);

    try {
      const loggedUser = await supabase.auth.getUser();
      if (!loggedUser?.data.user) {
        throw new Error(t("transfer.error.authRequired"));
      }

      const userMetadata = loggedUser.data.user.user_metadata as {
        salt: string;
        iv: string;
        ciphertext: string;
        wallet_address: string;
      };

      if (!userMetadata?.wallet_address) {
        throw new Error(t("transfer.error.senderWalletMissing"));
      }

      const privateKey = await decryptPrivateKey(values.password, userMetadata);
      if (!privateKey) {
        throw new Error(t("transfer.error.incorrectPassword"));
      }

      const privateKeyUint8Array = Uint8Array.from(Buffer.from(privateKey, "hex"));
      const recipientPublicKeyString = state.recipient.wallet_address.toBase58();

      const signature = await sendSolanaTransaction(
        privateKeyUint8Array,
        recipientPublicKeyString,
        state.formData.amount
      );

      if (!signature) {
        throw new Error(t("transfer.error.sendSignature"));
      }

      const txDetails = {
        from: userMetadata.wallet_address,
        to: recipientPublicKeyString,
        amount: state.formData.amount,
        signature: signature,
      };

      // Add to DB (fire and forget or await?)
      await addTransactionToDb(
        txDetails,
        { wallet_address: txDetails.from, email: loggedUser.data.user.email! },
        { wallet_address: txDetails.to, email: state.recipient.email },
        new Date().toISOString()
      );

      // Check contact status *after* successful transaction
      await checkAndSetContactStatus(state.recipient.wallet_address);

      dispatch({ type: 'SEND_SUCCESS', payload: { transactionHash: signature } });

    } catch (err) {
      console.error("Error during transfer process:", err);
      let specificErrorMessage = t("transfer.error.unknown");
      if (err instanceof Error) {
          // Use the specific error messages thrown in the try block
          const knownErrorKeys = [
              t("transfer.error.authRequired"),
              t("transfer.error.senderWalletMissing"),
              t("transfer.error.incorrectPassword"),
              t("transfer.error.sendSignature"),
              t("transfer.error.invalidRecipientAddress") // Assuming sendSolanaTransaction throws this
          ];
          if (knownErrorKeys.includes(err.message)) {
             specificErrorMessage = err.message;
          } else if (err.message.includes("Transaction failed")) {
             specificErrorMessage = err.message; // Show specific RPC error if available
          } else {
             // Log unexpected errors but show generic message to user
             console.error("Unexpected transfer error message:", err.message);
             specificErrorMessage = t("transfer.error.generic"); // More generic for unexpected
          }
      }
      dispatch({ type: 'SET_ERROR', payload: { message: specificErrorMessage } });
    } finally {
      setIsSending(false);
      passwordForm.reset(); // Reset password field after attempt
    }
  }, [state.formData, state.recipient, supabase, dispatch, t, passwordForm, checkAndSetContactStatus]);


  const handleAddContact = useCallback(async () => {
    const loggedUser = await supabase.auth.getUser();
    if (!loggedUser?.data.user || !state.recipient) {
      console.error("User not logged in or recipient missing for addContact");
      return;
    }

    // Construct contact data carefully, ensuring all required fields for addContact action are present
    const contactToAdd: Partial<Contact> & { wallet_address: string; email: string } = {
        first_name: state.recipient.first_name,
        last_name: state.recipient.last_name,
        user_name: state.recipient.user_name,
        email: state.recipient.email,
        wallet_address: state.recipient.wallet_address.toBase58(),
        avatarUrl: state.recipient.avatar_url, // Ensure field names match Contact type and action expectation
    };

    try {
        const res = await addContact(contactToAdd as Contact, loggedUser.data.user); // Ensure type assertion is correct
        if (res && !res.error) {
            setIsContactAdded(true);
            // Invalidate contacts query after adding
            queryClient.invalidateQueries({ queryKey: ['contacts', { userId: loggedUser.data.user.id }] });
        } else {
            console.error("Error adding contact:", res?.error);
            // Optionally: provide user feedback that adding contact failed
        }
    } catch (error) {
        console.error("Failed to add contact:", error);
        // Optionally: provide user feedback
    }
  }, [supabase, state.recipient, queryClient]);


  const handleClose = useCallback(async () => {
    const loggedUser = await supabase.auth.getUser();
    // Invalidate queries that might have changed
    if (loggedUser?.data.user?.user_metadata?.wallet_address) {
      queryClient.invalidateQueries({
        queryKey: ['usdcBalance', { walletAddress: loggedUser.data.user.user_metadata.wallet_address }],
      });
    }
     if (loggedUser?.data.user?.id) {
       queryClient.invalidateQueries({ queryKey: ['contacts', { userId: loggedUser.data.user.id }] });
     }

    // Reset all local states
    dispatch({ type: 'RESET' });
    setUserBalance(null);
    setUserContact(null);
    setInputError(null);
    setIsContactAdded(undefined);
    setIsSending(false);
    transferForm.reset();
    passwordForm.reset();
  }, [supabase, queryClient, dispatch, setUserBalance, setUserContact, setInputError, transferForm, passwordForm]);


  // Handler for fetching initial balance when modal opens
  const handleModalOpen = useCallback(async () => {
      setInputError(null); // Clear errors on open
      try {
          const balance = await getUsdcBalance(); // Assumes getUsdcBalance fetches for the logged-in user
          if (balance !== undefined && balance !== null) { // Check for null/undefined explicitly
              setUserBalance(String(balance)); // Ensure it's set as string if needed by UI
          } else {
              setUserBalance("0"); // Set a default or indicate loading/error
          }
      } catch (error) {
          console.error("Failed to fetch balance on modal open:", error);
          setUserBalance(null); // Indicate error state
      }
  }, [setUserBalance, setInputError]);

  return {
    handleTransferFormSubmit,
    handlePasswordFormSubmit,
    handleAddContact,
    handleClose,
    handleModalOpen,
    isSending,
    isContactAdded, // Expose this for the Success step UI
    checkAndSetContactStatus, // Expose this maybe? Or handle internally in success step effect?
  };
} 