"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { passwordFormSchema } from "@/utils/schemas";
import { AlertCircle, CheckCircle, Loader2, Send } from "lucide-react";

interface TransactionConfirmationProps {
  recipient: string;
  amount: number;
  displayName?: string;
  onSubmitPassword: (password: string) => Promise<void>;
  onError?: (error: string) => void;
  onSuccess?: (hash: string) => void;
  status: "idle" | "resolving" | "processing" | "success" | "error";
  errorMessage?: string;
  transactionHash?: string;
}

export function TransactionConfirmation({
  recipient,
  amount,
  displayName,
  onSubmitPassword,
  onError,
  status,
  errorMessage = "",
  transactionHash = "",
}: TransactionConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleConfirm = () => {
    setShowPasswordInput(true);
  };

  const handleSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    setIsConfirming(true);

    try {
      await onSubmitPassword(values.password);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown error occurred";
      if (onError) onError(errorMsg);
    } finally {
      setIsConfirming(false);
      passwordForm.reset();
    }
  };

  if (status === "resolving") {
    return (
      <Card className="w-full border-neutral-700 bg-neutral-800 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-zinc-300">
            <Loader2 size={20} className="animate-spin" />
            <span>Resolving recipient address...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="w-full border-neutral-700 bg-neutral-800 text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-2 text-green-500">
            <CheckCircle size={48} />
            <span className="text-lg font-medium">Transaction successful!</span>
            {transactionHash && (
              <span className="text-sm text-zinc-400 break-all">
                {transactionHash}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="w-full border-neutral-700 bg-neutral-800 text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-2 text-red-500">
            <AlertCircle size={48} />
            <span className="text-lg font-medium">Transaction failed</span>
            <span className="text-sm text-zinc-400">{errorMessage}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "processing") {
    return (
      <Card className="w-full border-neutral-700 bg-neutral-800 text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-2 text-zinc-300">
            <Loader2 size={48} className="animate-spin" />
            <span className="text-lg font-medium">
              Processing transaction...
            </span>
            <span className="text-sm text-zinc-400">
              Please wait while we process your transaction
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-neutral-700 bg-neutral-800 text-white">
      {!showPasswordInput ? (
        <>
          <CardHeader>
            <CardTitle className="text-center">Confirm Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="bg-violet-600/20 p-3 rounded-full">
                <Send size={24} className="text-violet-500" />
              </div>
              <div className="text-2xl font-bold">{amount} USDC</div>
              <div className="text-zinc-400">to</div>
              <div className="text-lg font-medium">
                {displayName || recipient}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="default"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
              onClick={handleConfirm}
            >
              Confirm Transfer
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle className="text-center">Enter Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="text-center mb-4">
                  <div className="text-lg font-medium">
                    Sending {amount} USDC to {displayName || recipient}
                  </div>
                </div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="bg-neutral-700 border-neutral-600 text-white h-12 text-lg"
                  {...passwordForm.register("password")}
                  disabled={isConfirming}
                />
                {passwordForm.formState.errors.password && (
                  <p className="text-red-500 text-sm">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isConfirming}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white h-12"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordInput(false)}
                  disabled={isConfirming}
                  className="flex-1 border-neutral-600 text-white hover:bg-neutral-700 h-12"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </>
      )}
    </Card>
  );
}
