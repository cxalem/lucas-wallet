import { ChatMessage } from "./chat-message";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Message } from "@ai-sdk/react";
import type { ChangeEvent, FormEvent, RefObject } from "react";
import { EmptyChat } from "./empty-chat";
import { LoadingIndicator } from "./loading-indicator";
import { User } from "@supabase/supabase-js";

interface ChatContainerProps {
  messages: Message[];
  user: User;
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | { target: { value: string } }) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>, mentionedContacts?: { id: string, name: string }[], transactionResult?: { success: boolean, hash?: string, error?: string }) => void;
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export function ChatContainer({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messagesEndRef,
}: ChatContainerProps) {
  // This function will be passed to ChatMessage components to handle transaction results
  const handleTransactionResult = (success: boolean, data: { hash?: string, error?: string }) => {
    // Create a custom event to pass transaction results to the handleSubmit function
    const customEvent = {
      preventDefault: () => { },
    } as FormEvent<HTMLFormElement>;

    // Call handleSubmit with the transaction result
    handleSubmit(
      customEvent,
      undefined,
      {
        success,
        ...(data.hash && { hash: data.hash }),
        ...(data.error && { error: data.error })
      }
    );
  };

  return (
    <section className="flex flex-col items-center text-zinc-100 h-full">
      <Card className="w-full max-w-3xl flex flex-col justify-between shadow-lg border-neutral-50/10 bg-neutral-800 h-full">
        <ChatHeader />

        <CardContent className="p-0 h-full">
          <div className="h-full max-h-[calc(50vh)] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <EmptyChat />
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onTransactionResult={handleTransactionResult}
                />
              ))
            )}

            {isLoading && <LoadingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <CardFooter>
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardFooter>
      </Card>
    </section>
  );
}
