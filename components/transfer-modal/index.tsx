"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { passwordFormSchema, transferFormSchema } from "@/utils/schemas";
import { Contact } from "@/types";
import { TransferModalFirstStep } from "./first-transfer-step";
import { TransferModalSecondStep } from "./second-transfer-step";
import { TransferModalThirdStep } from "./third-transfer-step";
import { SendingTransactionStep } from "./sending-transaction-step";
import { TransferSuccess } from "./success-step";
import { ContactCard } from "../contacts/contact-card";

import { useI18n } from "@/locales/client";

import {
  useTransferState,
  TransferStates,
  TransferState,
} from "./useTransferState";
import { useTransferHandlers } from "./useTransferHandlers";

type TransferModalProps = {
  type?: "transfer" | "contact";
  contact?: Contact;
  triggerButton?: React.ReactNode;
};

export default function TransferModal({
  type = "transfer",
  contact,
  triggerButton,
}: TransferModalProps) {
  const t = useI18n();
  const { state, dispatch } = useTransferState();

  const [userBalance, setUserBalance] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [userContact, setUserContact] = useState<Contact | null>(null);

  const transferForm = useForm<z.infer<typeof transferFormSchema>>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      email: contact?.email || "",
      amount: 0,
    },
  });
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  const {
    handleTransferFormSubmit,
    handlePasswordFormSubmit,
    handleAddContact,
    handleClose,
    handleModalOpen,
    isSending,
    isContactAdded,
  } = useTransferHandlers({
    state,
    dispatch,
    transferForm,
    passwordForm,
    setInputError,
    setUserBalance,
    setUserContact,
  });

  const progressValue = useMemo(() => {
    switch (state.state) {
      case TransferStates.Idle:
        return 0;
      case TransferStates.Validating:
        return 25;
      case TransferStates.Pending:
        return 50;
      case TransferStates.Sending:
        return 75;
      case TransferStates.Success:
      case TransferStates.Error:
        return 100;
      default:
        return 0;
    }
  }, [state.state]);

  function getDialogTitle(currentState: TransferState) {
    switch (currentState) {
      case TransferStates.Validating:
        return t("transfer.title.confirm");
      case TransferStates.Pending:
        return t("transfer.title.confirmPassword");
      case TransferStates.Sending:
        return t("transfer.title.processing");
      case TransferStates.Success:
        return t("transfer.title.success");
      case TransferStates.Error:
        return t("transfer.title.failed");
      default:
        return t("transfer.title.default");
    }
  }

  function getDialogDescription(currentState: TransferState) {
    switch (currentState) {
      case TransferStates.Validating:
        return t("transfer.description.confirm");
      case TransferStates.Pending:
        return t("transfer.description.confirmPassword");
      case TransferStates.Sending:
        return t("transfer.description.processing");
      case TransferStates.Success:
        return t("transfer.description.success");
      case TransferStates.Error:
        return t("transfer.description.failed");
      default:
        return t("transfer.description.default");
    }
  }

  return (
    <Dialog onOpenChange={(open) => !open && handleClose()}>
      {triggerButton ? (
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      ) : type === "transfer" ? (
        <DialogTrigger asChild>
          <Button
            onClick={handleModalOpen}
            className="bg-gradient-to-r from-violet-800 via-violet-600 to-violet-800 px-10 py-2 rounded-full text-zinc-50 font-medium hover:shadow-xl w-full duration-150 shadow-md"
          >
            {t("transfer.button.trigger")}
          </Button>
        </DialogTrigger>
      ) : (
        type === "contact" &&
        contact && (
          <DialogTrigger asChild>
            <ContactCard
              contact={contact as Contact}
              setUserContact={setUserContact}
              setUserBalance={setUserBalance}
              transferForm={transferForm}
            />
          </DialogTrigger>
        )
      )}

      <DialogContent className="bg-neutral-900 border-neutral-700">
        {state.state !== TransferStates.Idle &&
          state.state !== TransferStates.Success &&
          state.state !== TransferStates.Error && (
            <Progress value={progressValue} className="w-full h-2 mb-4" />
          )}
        <div className="relative">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl mb-1">
              {getDialogTitle(state.state)}
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              {getDialogDescription(state.state)}
            </DialogDescription>
          </DialogHeader>

          {state.state === TransferStates.Validating &&
          state.formData &&
          state.recipient ? (
            <TransferModalSecondStep
              transferData={state.formData}
              recipient={state.recipient}
              onConfirm={() => dispatch({ type: "VALIDATION_SUCCESS" })}
              onBack={() => dispatch({ type: "GO_BACK_TO_IDLE" })}
            />
          ) : state.state === TransferStates.Pending ? (
            <TransferModalThirdStep
              passwordForm={passwordForm}
              handlePasswordFormSubmit={handlePasswordFormSubmit}
              onBack={() => dispatch({ type: "GO_BACK_TO_VALIDATING" })}
              isSending={isSending}
              errorMessage={state.errorMessage ?? undefined}
            />
          ) : state.state === TransferStates.Sending ? (
            <SendingTransactionStep />
          ) : state.state === TransferStates.Success ? (
            <TransferSuccess
              onClick={handleClose}
              transferData={state.formData}
              recipient={state.recipient}
              transactionHash={state.transactionHash}
              isContactAdded={isContactAdded}
              handleAddContact={handleAddContact}
              onAddContactSuccess={() => {}}
            />
          ) : state.state === TransferStates.Error ? (
            <div className="flex flex-col items-center gap-4 pt-4">
              <p className="text-red-500 text-center">
                {state.errorMessage || t("transfer.error.generic")}
              </p>
              <Button
                variant="outline"
                onClick={() => dispatch({ type: "RETRY" })}
              >
                {t("transfer.button.retry")}
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                {t("transfer.button.close")}
              </Button>
            </div>
          ) : (
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
