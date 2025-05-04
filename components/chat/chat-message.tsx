"use client";

import { Avatar } from "@/components/ui/avatar";
import type { Message } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { MentionTooltip } from "@/components/contacts/mention-tooltip";
import { getContacts } from "@/components/contacts/actions";
import { useUser } from "@/context/user-context";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { TransactionConfirmationWrapper } from "./transaction-confirmation-wrapper";

interface ChatMessageProps {
  message: Message;
  onTransactionResult?: (
    success: boolean,
    data: { hash?: string; error?: string }
  ) => void;
}

export function ChatMessage({
  message,
  onTransactionResult,
}: ChatMessageProps) {
  const [parsedContent, setParsedContent] = useState<React.ReactNode[]>([]);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const { user } = useUser();

  const { data: contacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!user) return [];
      return getContacts(user);
    },
    enabled: !!user,
  });

  // Process text content and mentions - only for text parts
  useEffect(() => {
    if (!message.parts || !contacts) return;

    // Process only text parts for mentions
    const textParts = message.parts.filter((part) => part.type === "text");

    textParts.forEach((part, idx) => {
      const nodes: React.ReactNode[] = [];
      const text = part.text || "";

      // Match @username pattern
      const regex = /@([a-zA-Z0-9_]+)/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        const mentionName = match[1];
        const matchedContact = contacts.find(
          (contact) =>
            (contact.user_name &&
              contact.user_name.toLowerCase() === mentionName.toLowerCase()) ||
            ((contact.first_name || "") + (contact.last_name || ""))
              .toLowerCase()
              .replace(/\s+/g, "") === mentionName.toLowerCase()
        );

        // Add text before the mention
        if (match.index > lastIndex) {
          nodes.push(text.substring(lastIndex, match.index));
        }

        // Add the mention with tooltip if contact found
        if (matchedContact) {
          nodes.push(
            <MentionTooltip
              key={`mention-${idx}-${match.index}`}
              contact={matchedContact}
            >
              {match[0]}
            </MentionTooltip>
          );
        } else {
          nodes.push(match[0]);
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        nodes.push(text.substring(lastIndex));
      }

      setParsedContent(nodes);
    });
  }, [message.parts, contacts]);

  const handleTransactionSuccess = (hash: string) => {
    setTransactionHash(hash);
    setTransactionError(null);

    // Notify parent component about transaction success
    if (onTransactionResult) {
      onTransactionResult(true, { hash });
    }
  };

  const handleTransactionError = (error: string) => {
    setTransactionError(error);
    setTransactionHash(null);

    // Notify parent component about transaction failure
    if (onTransactionResult) {
      onTransactionResult(false, { error });
    }
  };

  if (!user || !contacts) return null;

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex gap-3 max-w-[80%] ${
          message.role === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Avatar
          className={`h-8 w-8 flex items-center justify-center text-zinc-100 ${
            message.role === "user" ? "bg-blue-500" : "bg-neutral-700"
          }`}
        >
          {message.role === "user" ? (
            <span className="text-xs font-medium">You</span>
          ) : (
            <span className="text-xs font-medium">AI</span>
          )}
        </Avatar>

        <div
          className={`p-3 rounded-lg ${
            message.role === "user"
              ? "bg-blue-600 text-white rounded-tr-none"
              : "bg-neutral-700 text-zinc-100 rounded-tl-none"
          }`}
        >
          {/* Render message parts */}
          {message.parts?.map((part, i) => {
            // Text parts - render with mentions
            if (part.type === "text") {
              return (
                <div key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                  {parsedContent.length > 0 ? parsedContent : part.text}
                </div>
              );
            }
            // Tool invocation parts - render transaction confirmation if needed
            else if (part.type === "tool-invocation") {
              if (part.toolInvocation.toolName === "sendUSDC") {
                // Only access args if transaction hasn't been processed yet
                if (!transactionHash && !transactionError) {
                  const args = part.toolInvocation.args;

                  return (
                    <TransactionConfirmationWrapper
                      key={`${message.id}-tool-${i}`}
                      recipient={args.to}
                      amount={args.amount}
                      onSuccess={handleTransactionSuccess}
                      onError={handleTransactionError}
                    />
                  );
                }
              }
            }
            return null;
          })}

          {/* Transaction Success UI */}
          {transactionHash && (
            <div className="mt-2 p-3 bg-green-900/30 rounded-md border border-green-500/30 text-green-200 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">Transaction successful!</span>
              </div>

              <div className="flex items-center justify-between bg-black/20 rounded p-2 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Hash:</span>
                  <span className="text-xs font-mono">
                    {transactionHash.substring(0, 8)}...
                    {transactionHash.substring(transactionHash.length - 8)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(transactionHash);
                      // Optional: Add toast notification here
                    }}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title="Copy transaction hash"
                  >
                    <svg
                      className="h-4 w-4 text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>

                  <a
                    href={`https://explorer.solana.com/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title="View on Solana Explorer"
                  >
                    <svg
                      className="h-4 w-4 text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Error UI */}
          {transactionError && (
            <div className="mt-2 p-2 bg-red-900/30 rounded-md border border-red-500/30 text-red-200 text-sm">
              <p>Transaction failed: {transactionError}</p>
            </div>
          )}
          

          <div className="text-xs opacity-70 mt-1 text-right">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
