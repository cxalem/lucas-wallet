"use client";

import { useRef, useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { MentionsDropdown } from "@/components/contacts/mentions-dropdown";
import { Contact } from "@/types";
import { getContacts } from "@/components/contacts/actions";
import { useUser } from "@/context/user-context";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | { target: { value: string } }) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>, mentionedContacts?: {id: string, name: string}[]) => void;
  isLoading: boolean;
}

// Define a custom event type that extends FormEvent
interface MentionFormEvent extends FormEvent<HTMLFormElement> {
  mentionData?: {
    mentionedContacts: {id: string, name: string}[];
  };
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showMentionsDropdown, setShowMentionsDropdown] = useState(false);
  const [mentionSearchText, setMentionSearchText] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [mentionedContacts, setMentionedContacts] = useState<{id: string, name: string}[]>([]);
  const [caretAtMention, setCaretAtMention] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    
    // Fetch contacts when component mounts
    const fetchContacts = async () => {
      const contactsData = await getContacts(user);
      setContacts(contactsData);
    };
    
    fetchContacts();
  }, [user]);

  const handleQuickMessage = (message: string) => {
    const event = {
      target: { value: message },
    } as ChangeEvent<HTMLInputElement>;

    handleInputChange(event);
  };

  const handleInputKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const cursorPosition = e.currentTarget.selectionStart || 0;
    
    // Find the @ symbol before the cursor
    let startIndex = -1;
    let tokenEnd = -1;
    
    for (let i = cursorPosition - 1; i >= 0; i--) {
      // If we hit a space or start of string, check if next char is @
      if (value[i] === ' ' || i === 0) {
        const afterSpaceIndex = i === 0 ? 0 : i + 1;
        if (value[afterSpaceIndex] === '@') {
          startIndex = afterSpaceIndex;
          break;
        }
      }
    }
    
    // If we found a starting @
    if (startIndex >= 0) {
      // Find the end of the current token
      tokenEnd = startIndex;
      for (let i = startIndex + 1; i < value.length; i++) {
        if (value[i] === ' ' || i === value.length - 1) {
          tokenEnd = i === value.length - 1 ? i + 1 : i;
          break;
        }
        tokenEnd = i + 1;
      }
      
      // Check if caret is immediately after the token
      const caretIsAtToken = cursorPosition === tokenEnd;
      setCaretAtMention(caretIsAtToken);
      
      const searchText = value.substring(startIndex + 1, tokenEnd);
      setMentionStartIndex(startIndex);
      setMentionSearchText(searchText);
      
      // Only show dropdown if there's text after @ or we have results
      const shouldShowDropdown = searchText.length > 0 || 
        contacts.some(contact => 
          `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase().includes('') ||
          (contact.user_name || '').toLowerCase().includes('')
        );
        
      setShowMentionsDropdown(shouldShowDropdown && caretIsAtToken);
    } else {
      setShowMentionsDropdown(false);
      setCaretAtMention(false);
    }

    // Handle navigation with escape/tab/enter keys when dropdown is open
    if (showMentionsDropdown && (e.key === 'Escape' || e.key === 'Tab' || e.key === 'Enter')) {
      setShowMentionsDropdown(false);
    }
  };

  // Also handle click and blur to hide dropdown when clicking elsewhere
  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const cursorPosition = e.currentTarget.selectionStart || 0;
    
    // Check if we're clicking in an active mention token
    let inMentionToken = false;
    
    if (mentionStartIndex >= 0) {
      // Find the end of the current mention token
      let tokenEnd = mentionStartIndex;
      for (let i = mentionStartIndex + 1; i < value.length; i++) {
        if (value[i] === ' ' || i === value.length - 1) {
          tokenEnd = i === value.length - 1 ? i + 1 : i;
          break;
        }
        tokenEnd = i + 1;
      }
      
      inMentionToken = cursorPosition > mentionStartIndex && cursorPosition <= tokenEnd;
      setCaretAtMention(inMentionToken);
      
      // Hide dropdown if we clicked away from mention
      if (!inMentionToken) {
        setShowMentionsDropdown(false);
      }
    }
  };
  
  const handleInputBlur = () => {
    // Don't hide dropdown immediately to allow for click events
    setTimeout(() => {
      setShowMentionsDropdown(false);
    }, 200);
  };

  const handleContactSelect = (contact: Contact) => {
    if (!inputRef.current) return;
    
    // Use username if name fields are empty
    let displayText;
    if (contact.first_name || contact.last_name) {
      displayText = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
    } else if (contact.user_name) {
      displayText = contact.user_name;
    } else if (contact.email) {
      displayText = contact.email.split('@')[0];
    } else {
      displayText = 'User';
    }
    
    const displayName = `@${displayText}`;
    const newValue = 
      input.substring(0, mentionStartIndex) + 
      displayName + 
      ' ' + 
      input.substring(inputRef.current.selectionStart || 0);
    
    // Add contact to mentioned contacts list
    setMentionedContacts([
      ...mentionedContacts, 
      { id: contact.id, name: displayText }
    ]);
    
    handleInputChange({ target: { value: newValue } });
    setShowMentionsDropdown(false);
    
    // Focus input and set cursor position after the inserted mention
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPosition = mentionStartIndex + displayName.length + 1;
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent the default form submission behavior
    e.preventDefault();
    
    // Add metadata for mentioned contacts to the event
    const customEvent = {
      ...e,
      mentionData: {
        mentionedContacts,
      }
    } as MentionFormEvent;
    
    handleSubmit(customEvent, mentionedContacts);
    setMentionedContacts([]);
  };

  return (
    <div className="w-full bg-neutral-700 rounded-3xl px-6 py-3 border border-neutral-50/20 relative">
      <form onSubmit={onSubmit} className="flex w-full gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyUp={handleInputKeyUp}
            onClick={handleInputClick}
            onBlur={handleInputBlur}
            placeholder="Type your message..."
            className="w-full border-none focus:outline-none placeholder:text-sm text-zinc-100 placeholder:text-zinc-400"
            disabled={isLoading}
          />
          
          <MentionsDropdown
            contacts={contacts}
            searchTerm={mentionSearchText}
            onSelect={handleContactSelect}
            isOpen={showMentionsDropdown}
            caretAtMention={caretAtMention}
          />
        </div>
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
