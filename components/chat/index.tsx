"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { ChatContainer } from "@/components/chat/chat-container";
import { LoadingScreen } from "@/components/chat/loading-screen";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import type { ChangeEvent, FormEvent } from "react";

// Create a type that matches the required event structure for chatHandleInputChange
type ChatInputEvent = ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>;

// Create a type for submit events, which could be form events or custom event-like objects
type SubmitEventType = FormEvent<HTMLFormElement> | { preventDefault?: () => void };

// Create a function to convert simple value objects to event-like objects
const createEventFromValue = (value: string): ChatInputEvent => {
  // Create a simpler synthetic event that includes only the essential properties
  const mockInputElement = {
    value,
    name: '',
    type: 'text',
  } as HTMLInputElement;

  return {
    target: mockInputElement,
    currentTarget: mockInputElement,
    nativeEvent: new Event('input'), // Use the standard Event constructor
    bubbles: false,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: false,
    preventDefault: () => { },
    isDefaultPrevented: () => false,
    stopPropagation: () => { },
    isPropagationStopped: () => false,
    persist: () => { },
    timeStamp: Date.now(),
    type: 'change'
  } as ChatInputEvent;
};

export default function Chat() {
  const { messages, input, handleInputChange: chatHandleInputChange, handleSubmit: chatHandleSubmit, isLoading } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);

  // Adapter for input change handler
  const handleInputChange = (e: ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
    // If it's a simple object, convert it to a proper event
    if ('target' in e && !('nativeEvent' in e)) {
      chatHandleInputChange(createEventFromValue(e.target.value));
    } else {
      chatHandleInputChange(e as ChatInputEvent);
    }
  };

  // Adapter for submit handler
  const handleSubmit = (e: SubmitEventType) => {
    // Only call preventDefault if it exists
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    // Simply pass the event to the original handler
    // The API will extract any @mentions from the message content
    chatHandleSubmit(e);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <ChatContainer
      messages={messages}
      user={user}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
    />
  );
}
