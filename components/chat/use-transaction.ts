"use client";

import { useState, useCallback } from 'react';
import { isValidSolanaAddress } from "@/lib/utils";
import { getContacts } from "@/components/contacts/actions";
import { PublicKey } from "@solana/web3.js";
import { createClient } from "@/utils/supabase/client";
import { decryptPrivateKey, sendSolanaTransaction, addTransactionToDb } from "@/components/transfer-modal/actions";
import { useUser } from "@/context/user-context";

export type TransactionStatus = "idle" | "resolving" | "processing" | "success" | "error";

export function useTransaction(initialRecipient: string) {
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState<string>(initialRecipient);
  
  const { user } = useUser();
  const supabase = createClient();

  // Resolve the recipient address
  const resolveRecipientAddress = useCallback(async (recipient: string) => {
    if (!recipient) {
      setErrorMessage("No recipient specified");
      setStatus("error");
      return false;
    }

    setStatus("resolving");
    
    try {
      // Check if it's a valid Solana address
      const isValidAddress = isValidSolanaAddress(recipient);
      
      // First, check if we can find a user associated with this address/username
      if (user) {
        const contacts = await getContacts(user);
        const recipientLower = recipient.toLowerCase();
        
        const matchedContact = contacts.find(
          contact => 
            (contact.user_name && contact.user_name.toLowerCase() === recipientLower) || 
            (contact.email && contact.email.toLowerCase() === recipientLower) ||
            (isValidAddress && contact.wallet_address === recipient)
        );
        
        if (matchedContact) {
          // If we found a match, use the wallet address and display name
          setResolvedAddress(matchedContact.wallet_address);
          setRecipientName(matchedContact.user_name || matchedContact.email || recipient);
          setStatus("idle");
          return true;
        }
      }
      
      // If not in contacts, check in our profiles database
      const { data, error } = await supabase
        .from("profiles")
        .select("*, email, wallet_address, user_name, first_name, last_name")
        .or(`user_name.ilike.${recipient},email.ilike.${recipient}${isValidAddress ? `,wallet_address.eq.${recipient}` : ''}`)
        .limit(1);
        
      if (!error && data && data.length > 0 && data[0].wallet_address) {
        setResolvedAddress(data[0].wallet_address);
        setRecipientName(data[0].user_name || data[0].email || recipient);
        setStatus("idle");
        return true;
      }
      
      // If it's a valid address but we didn't find a matching user, just use it directly
      if (isValidAddress) {
        setResolvedAddress(recipient);
        setStatus("idle");
        return true;
      }
      
      // If no match found and not a valid address
      setErrorMessage(`Could not resolve "${recipient}" to a valid wallet address`);
      setStatus("error");
      return false;
    } catch {
      setErrorMessage("Failed to resolve recipient address");
      setStatus("error");
      return false;
    }
  }, [user, supabase]);

  // Execute the transaction with password
  const executeTransaction = useCallback(async (password: string, amount: number) => {
    if (!resolvedAddress) {
      setErrorMessage("Invalid recipient address");
      setStatus("error");
      throw new Error("Invalid recipient address");
    }
    
    setStatus("processing");
    
    try {
      const loggedUser = await supabase.auth.getUser();
      if (!loggedUser?.data.user) {
        throw new Error("Authentication required");
      }

      const userMetadata = loggedUser.data.user.user_metadata as {
        salt: string;
        iv: string;
        ciphertext: string;
        wallet_address: string;
      };

      if (!userMetadata?.wallet_address) {
        throw new Error("Wallet not found");
      }

      const privateKey = await decryptPrivateKey(password, userMetadata);
      if (!privateKey) {
        throw new Error("Incorrect password");
      }

      const privateKeyUint8Array = Uint8Array.from(Buffer.from(privateKey, "hex"));
      
      // Use the resolved address here
      let signature: string;
      try {
        // Validate the address by trying to create a PublicKey object
        const recipientPublicKey = new PublicKey(resolvedAddress);
        
        signature = await sendSolanaTransaction(
          privateKeyUint8Array,
          recipientPublicKey.toBase58(), // Use correctly formatted address
          amount
        );

        if (!signature) {
          throw new Error("Failed to send transaction");
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes("Invalid public key input")) {
          throw new Error("Invalid recipient address format");
        }
        throw err;
      }

      // Add transaction to database
      const txDetails = {
        from: userMetadata.wallet_address,
        to: resolvedAddress,
        amount: amount,
        signature: signature,
      };

      // Store transaction in database
      await addTransactionToDb(
        txDetails,
        { wallet_address: txDetails.from, email: loggedUser.data.user.email! },
        { wallet_address: txDetails.to, email: "" }, // We might not know the email in chat context
        new Date().toISOString()
      );

      setTransactionHash(signature);
      setStatus("success");
      return signature;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMessage(errorMsg);
      setStatus("error");
      throw err;
    }
  }, [resolvedAddress, supabase]);

  // Initialize the transaction process
  const initTransaction = useCallback(async (recipient: string, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    amount: number) => {
    // Reset state
    setErrorMessage("");
    setTransactionHash("");
    setStatus("idle");
    setRecipientName(recipient);
    
    // Resolve the recipient address
    return await resolveRecipientAddress(recipient);
  }, [resolveRecipientAddress]);

  return {
    status,
    errorMessage,
    transactionHash,
    recipientName,
    resolvedAddress,
    initTransaction,
    executeTransaction,
  };
} 