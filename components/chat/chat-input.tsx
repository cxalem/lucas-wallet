"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChangeEvent, FormEvent } from "react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const handleQuickMessage = (message: string) => {
    const event = {
      target: { value: message },
    } as ChangeEvent<HTMLInputElement>;

    handleInputChange(event);
  };

  return (
    <div className="w-full bg-neutral-700 rounded-3xl px-6 py-3 border border-neutral-50/20">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 border-none focus:outline-none placeholder:text-sm text-zinc-100 placeholder:text-zinc-400"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="shrink-0 rounded-full bg-neutral-200 text-neutral-700 hover:bg-neutral-300 cursor-pointer"
        >
          <Send size={18} />
        </Button>
      </form>
      <div className="flex gap-2 mt-2">
        <Button
          type="button"
          onClick={() => handleQuickMessage("send transaction")}
          variant="outline"
          size="sm"
          className="text-xs cursor-pointer bg-neutral-700 border-neutral-50/10 text-zinc-100 hover:bg-neutral-600 rounded-full"
        >
          Send Transaction
        </Button>
        <Button
          type="button"
          onClick={() => handleQuickMessage("get transactions")}
          variant="outline"
          size="sm"
          className="text-xs cursor-pointer bg-neutral-700 border-neutral-50/10 text-zinc-100 hover:bg-neutral-600 rounded-full"
        >
          Get Transactions
        </Button>
        <Button
          type="button"
          onClick={() => handleQuickMessage("buy SOL")}
          variant="outline"
          size="sm"
          className="text-xs cursor-pointer bg-neutral-700 border-neutral-50/10 text-zinc-100 hover:bg-neutral-600 rounded-full"
        >
          Buy SOL
        </Button>
      </div>
    </div>
  );
}
