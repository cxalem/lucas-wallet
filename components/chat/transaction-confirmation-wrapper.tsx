"use client";

import { useEffect } from "react";
import { TransactionConfirmation } from "./transaction-confirmation";
import { useTransaction } from "./use-transaction";

interface TransactionConfirmationWrapperProps {
  recipient: string;
  amount: number;
  onSuccess: (hash: string) => void;
  onError: (error: string) => void;
}

export function TransactionConfirmationWrapper({
  recipient,
  amount,
  onSuccess,
  onError,
}: TransactionConfirmationWrapperProps) {
  const {
    status,
    errorMessage,
    transactionHash,
    recipientName,
    initTransaction,
    executeTransaction,
  } = useTransaction(recipient);

  // Initialize transaction when the component mounts
  useEffect(() => {
    initTransaction(recipient, amount);
  }, [recipient, amount, initTransaction]);

  // Call onSuccess/onError when transaction completes
  useEffect(() => {
    if (status === "success" && transactionHash) {
      onSuccess(transactionHash);
    } else if (status === "error" && errorMessage) {
      onError(errorMessage);
    }
  }, [status, transactionHash, errorMessage, onSuccess, onError]);

  const handleSubmitPassword = async (password: string) => {
    try {
      await executeTransaction(password, amount);
    } catch (error) {
      console.error("Error executing transaction:", error);
      // Error is already handled by the hook and will update status
    }
  };

  return (
    <TransactionConfirmation
      recipient={recipient}
      amount={amount}
      displayName={recipientName}
      onSubmitPassword={handleSubmitPassword}
      onError={onError}
      onSuccess={onSuccess}
      status={status}
      errorMessage={errorMessage}
      transactionHash={transactionHash}
    />
  );
} 